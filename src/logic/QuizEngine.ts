import { elements, Element } from '../data/elements';

export type QuizMode = 
  | 'mcq' 
  | 'fillblank' 
  | 'builder' 
  | 'daily' 
  | 'survival' 
  | 'ghost';

export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  options: string[];
  elementId: number;
  modeType?: 'flashcard' | 'mcq' | 'fillblank' | 'builder';
  subtext?: string;
  mnemonic?: string;
  elementObj?: Element;
  builderData?: {
    posSymbol: string;
    posValency: string;
    negSymbol: string;
    negValency: string;
  };
}

export interface MistakeLogItem {
  id: string;
  elementId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  note: string;
  timestamp: number;
}

export interface UserProfile {
  xp: number;
  dailyStreak: number;
  lastActiveDate: string;
  classCode: string;
}

// Simple seeded random for shuffling
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Seeded RNG generator for daily challenge
const seededRandom = (seed: number) => {
  let t = seed += 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
};

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const cleanSymbol = (sym: string): string => {
  // Remove superscripts like ⁺, ⁻, ²⁻, ³⁻, etc. and regular + / -
  return sym.replace(/[⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹\+\-]/g, '');
};

export class QuizEngine {
  static getStats() {
    try {
      const stats = localStorage.getItem('elementStats');
      return stats ? JSON.parse(stats) : { seen: [], wrong: [], responseTimes: [], streaks: {} };
    } catch {
      return { seen: [], wrong: [], responseTimes: [], streaks: {} };
    }
  }

  static getCleanStats() {
    const stats = this.getStats();
    if (!stats.seen) stats.seen = [];
    if (!stats.wrong) stats.wrong = [];
    if (!stats.responseTimes) stats.responseTimes = [];
    if (!stats.streaks) stats.streaks = {};
    return stats;
  }

  static getProfile(): UserProfile {
    try {
      const p = localStorage.getItem('userProfile');
      const today = new Date().toDateString();
      if (p) {
        const parsed = JSON.parse(p);
        // check streak logic
        if (parsed.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (parsed.lastActiveDate === yesterday.toDateString()) {
            parsed.dailyStreak += 1;
          } else if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
            // missed a day
            parsed.dailyStreak = 1;
          }
          parsed.lastActiveDate = today;
          localStorage.setItem('userProfile', JSON.stringify(parsed));
        }
        return parsed;
      } else {
        const initial: UserProfile = { xp: 0, dailyStreak: 1, lastActiveDate: today, classCode: 'CHEM-IX-A' };
        localStorage.setItem('userProfile', JSON.stringify(initial));
        return initial;
      }
    } catch {
      return { xp: 0, dailyStreak: 1, lastActiveDate: new Date().toDateString(), classCode: 'CHEM-IX-A' };
    }
  }

  static addXP(amount: number) {
    try {
      const profile = this.getProfile();
      profile.xp += amount;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save XP', e);
    }
  }

  static setClassCode(code: string) {
    try {
      const profile = this.getProfile();
      profile.classCode = code.toUpperCase();
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save Class Code', e);
    }
  }

  static getMistakeLog(): MistakeLogItem[] {
    try {
      const log = localStorage.getItem('mistakeLog');
      return log ? JSON.parse(log) : [];
    } catch {
      return [];
    }
  }

  static clearMistakes() {
    try {
      localStorage.setItem('mistakeLog', JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear mistakes', e);
    }
  }

  static recordAnswer(
    elementId: number, 
    isCorrect: boolean, 
    responseTimeMs?: number,
    questionText?: string,
    userAnswer?: string,
    correctAnswer?: string
  ): { xpEarned: number; isMasteredNow: boolean } {
    let xpEarned = 0;
    let isMasteredNow = false;

    try {
      const stats = this.getCleanStats();
      
      if (!stats.seen.includes(elementId)) {
        stats.seen.push(elementId);
      }

      const elObj = elements.find(e => e.id === elementId);
      const currentStreak = stats.streaks[elementId] || 0;

      if (isCorrect) {
        stats.streaks[elementId] = currentStreak + 1;
        if (stats.streaks[elementId] >= 3) {
          isMasteredNow = currentStreak < 3; // just hit mastered
          // Remove from wrong list if present
          stats.wrong = stats.wrong.filter((id: number) => id !== elementId);
        }

        // Calculate XP
        let baseXP = 10;
        let speedBonus = 0;
        if (responseTimeMs && responseTimeMs < 4000) {
          speedBonus = 5;
        }
        xpEarned = baseXP + speedBonus;
        this.addXP(xpEarned);

      } else {
        stats.streaks[elementId] = 0; // reset streak
        if (!stats.wrong.includes(elementId)) {
          stats.wrong.push(elementId);
        }

        // Save to mistake log
        if (questionText && userAnswer !== undefined && correctAnswer !== undefined) {
          const log = this.getMistakeLog();
          // avoid direct duplicates
          const filtered = log.filter(l => l.questionText !== questionText);
          filtered.unshift({
            id: Math.random().toString(36).substring(7),
            elementId,
            questionText,
            userAnswer,
            correctAnswer,
            note: elObj?.note || "Review valency guidelines.",
            timestamp: Date.now()
          });
          // cap at 50 mistakes
          localStorage.setItem('mistakeLog', JSON.stringify(filtered.slice(0, 50)));
        }
      }

      if (responseTimeMs && responseTimeMs > 0 && responseTimeMs < 60000) {
        stats.responseTimes.push(responseTimeMs);
        if (stats.responseTimes.length > 100) {
          stats.responseTimes.shift();
        }
      }

      localStorage.setItem('elementStats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }

    return { xpEarned, isMasteredNow };
  }

  static getPredecessorOptions(correctValency: string): string[] {
    const allVals = Array.from(new Set(elements.map(e => e.valency))).filter(v => v !== correctValency);
    return shuffleArray(allVals);
  }

  static generateBuilderQuestion(pool: Element[]): Question {
    // Separate candidates with positive/negative starting valencies or radicals
    let posCandidates = pool.filter(e => e.valency.includes('+') || e.valency === '4');
    let negCandidates = pool.filter(e => (e.valency.includes('−') || e.valency.includes('-') || e.valency === '4') && e.valency !== '0');

    // If pool is too restrictive (e.g. only metals), fallback to global elements
    if (posCandidates.length === 0) posCandidates = elements.filter(e => e.valency.includes('+'));
    if (negCandidates.length === 0) negCandidates = elements.filter(e => (e.valency.includes('−') || e.valency.includes('-')) && e.valency !== '0');

    const p = posCandidates[Math.floor(Math.random() * posCandidates.length)];
    const n = negCandidates[Math.floor(Math.random() * negCandidates.length)];

    // Extract basic integer valency ratio
    const parseVal = (v: string) => {
      const match = v.match(/\d+/);
      return match ? parseInt(match[0], 10) : 1;
    };

    const pVal = parseVal(p.valency);
    const nVal = parseVal(n.valency);

    let countP = nVal;
    let countN = pVal;

    // simplify ratio using GCD
    const common = gcd(countP, countN);
    countP /= common;
    countN /= common;

    const fmt = (sym: string, c: number, isRadical?: boolean) => {
      if (c <= 1) return sym;
      // if radical with length > 2 or sub tags, bracket it
      if (isRadical || sym.length > 2) {
        return `(${sym})_${c}`;
      }
      return `${sym}_${c}`;
    };

    const pClean = cleanSymbol(p.symbol);
    const nClean = cleanSymbol(n.symbol);

    // Correct flat representation for multiple choice
    const correctAnswer = `${fmt(pClean, countP, p.isRadical)}${fmt(nClean, countN, n.isRadical)}`
      .replace(/_/g, ''); // flat clean e.g. Al2O3 or (SO4)3

    // More realistic wrong options
    const wrong1 = `${fmt(pClean, countN, p.isRadical)}${fmt(nClean, countP, n.isRadical)}`.replace(/_/g, ''); // Swapped
    const wrong2 = `${pClean}${nClean}`; // No subscripts
    const wrong3 = `${fmt(pClean, pVal, p.isRadical)}${fmt(nClean, nVal, n.isRadical)}`.replace(/_/g, ''); // Original valencies (un-swapped)
    const wrong4 = `${fmt(pClean, nVal, p.isRadical)}${fmt(nClean, pVal, n.isRadical)}`.replace(/_/g, ''); // Unsimplified

    const optsSet = Array.from(new Set([wrong1, wrong2, wrong3, wrong4])).filter(o => o !== correctAnswer);
    let opts = shuffleArray(optsSet).slice(0, 3);
    while (opts.length < 3) {
      // If we still need options, try a variant with different subscripts
      const randomSub = Math.floor(Math.random() * 3) + 1;
      opts.push(`${pClean}${randomSub > 1 ? randomSub : ''}${nClean}${randomSub + 1}`);
      opts = Array.from(new Set(opts)).filter(o => o !== correctAnswer);
    }

    const fullOptions = shuffleArray([correctAnswer, ...opts.slice(0, 3)]);

    return {
      id: Math.random().toString(36).substring(7),
      text: `Combine: ${p.symbol} (${p.valency}) + ${n.symbol} (${n.valency})`,
      correctAnswer,
      options: fullOptions,
      elementId: p.id,
      modeType: 'builder',
      mnemonic: `Criss-cross valencies: ${p.symbol} gets ${nVal}, ${n.symbol} gets ${pVal}. Simplify ratio if needed!`,
      elementObj: p,
      builderData: {
        posSymbol: p.symbol,
        posValency: p.valency,
        negSymbol: n.symbol,
        negValency: n.valency
      }
    };
  }

  static generateQuestions(mode: QuizMode, count: number = 10, range?: [number, number]): Question[] {
    let pool = [...elements];

    if (range) {
      pool = pool.filter(e => e.id >= range[0] && e.id <= range[1]);
    }

    const stats = this.getCleanStats();

    // Specific pool targeting
    if (mode === 'daily') {
      const todaySeed = hashString(new Date().toDateString());
      const rng = seededRandom(todaySeed);
      const shuffled = [...elements].sort(() => rng() - 0.5);
      pool = shuffled.slice(0, 5);
      count = 5;
    } else if (mode === 'survival' || mode === 'ghost') {
      // Survival/Ghost uses the full pool but shuffled
      pool = pool.sort(() => Math.random() - 0.5);
      if (mode === 'ghost') count = 20;
      else count = 99; // Survival goes until fail
    }

    // Spaced repetition weighting: add unmastered/wrong elements more frequently
    if (mode !== 'daily') {
      const wrongPool = pool.filter(e => stats.wrong.includes(e.id));
      const unmasteredPool = pool.filter(e => (stats.streaks[e.id] || 0) < 3);
      pool = [
        ...pool,
        ...wrongPool,
        ...wrongPool, // duplicate wrong items to increase frequency
        ...unmasteredPool
      ];
    }

    pool = shuffleArray(pool);

    const questions: Question[] = [];
    const targetCount = (mode === 'daily') ? 5 : (mode === 'ghost' ? 20 : count);

    for (let i = 0; i < targetCount; i++) {
      const el = pool[i % pool.length];

      let modeType: 'mcq' | 'fillblank' | 'builder' = 'mcq';

      if (mode === 'fillblank') modeType = 'fillblank';
      else if (mode === 'builder') modeType = 'builder';
      else if (mode === 'daily' || mode === 'survival' || mode === 'ghost') {
        const r = Math.random();
        if (r < 0.35) modeType = 'fillblank';
        else if (r < 0.7) modeType = 'builder';
        else modeType = 'mcq';
      }

      if (modeType === 'builder') {
        questions.push(this.generateBuilderQuestion(pool));
        continue;
      }

      let text = '';
      let correctAnswer = '';
      let subtext = '';

      // Alternate question contexts to test element -> symbol, element -> valency, etc.
      const qStyle = Math.random();
      if (qStyle < 0.4) {
        text = `Valency of ${el.name}?`;
        correctAnswer = el.valency;
        subtext = modeType === 'fillblank' ? '' : `Symbol: ${el.symbol}`;
      } else if (qStyle < 0.8) {
        text = `Identify ${el.symbol}:`;
        correctAnswer = el.name;
        subtext = modeType === 'fillblank' ? '' : `Valency: ${el.valency}`;
      } else {
        text = `Symbol for ${el.name}?`;
        correctAnswer = el.symbol;
        subtext = modeType === 'fillblank' ? '' : `Valency: ${el.valency}`;
      }

      // Generate distinct wrong options
      let optPool: string[] = [];
      if (correctAnswer === el.valency) {
        optPool = shuffleArray(Array.from(new Set(elements.map(e => e.valency)))).filter(v => v !== correctAnswer);
      } else if (correctAnswer === el.name) {
        optPool = shuffleArray(Array.from(new Set(elements.map(e => e.name)))).filter(n => n !== correctAnswer);
      } else {
        optPool = shuffleArray(Array.from(new Set(elements.map(e => e.symbol)))).filter(s => s !== correctAnswer);
      }

      const options = shuffleArray([correctAnswer, ...optPool.slice(0, 3)]);

      questions.push({
        id: Math.random().toString(36).substring(7),
        text,
        correctAnswer,
        options,
        elementId: el.id,
        modeType,
        subtext,
        mnemonic: el.mnemonic || el.note,
        elementObj: el
      });
    }

    return questions;
  }
}
