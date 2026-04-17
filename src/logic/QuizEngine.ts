import { elements, Element } from '../data/elements';

export type QuizMode = 'positive' | 'negative' | 'mixed' | 'reverse' | 'symbol' | 'smart' | 'survival' | 'timeattack' | 'builder';

export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  options: string[];
  elementId: number;
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

export class QuizEngine {
  static getStats() {
    try {
      const stats = localStorage.getItem('elementStats');
      return stats ? JSON.parse(stats) : { seen: [], wrong: [], responseTimes: [] };
    } catch {
      return { seen: [], wrong: [], responseTimes: [] };
    }
  }

  static recordAnswer(elementId: number, isCorrect: boolean, responseTimeMs?: number) {
    try {
      const stats = this.getStats();
      if (!stats.seen) stats.seen = [];
      if (!stats.wrong) stats.wrong = [];
      if (!stats.responseTimes) stats.responseTimes = [];

      if (!stats.seen.includes(elementId)) {
        stats.seen.push(elementId);
      }
      if (!isCorrect && !stats.wrong.includes(elementId)) {
        stats.wrong.push(elementId);
      } else if (isCorrect && stats.wrong.includes(elementId)) {
        stats.wrong = stats.wrong.filter((id: number) => id !== elementId);
      }

      if (responseTimeMs && responseTimeMs > 0 && responseTimeMs < 60000) {
        stats.responseTimes.push(responseTimeMs);
        // keep last 100 for average
        if (stats.responseTimes.length > 100) {
          stats.responseTimes.shift();
        }
      }

      localStorage.setItem('elementStats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }

  static getPredecessorOptions(mode: string, baseAnswer: string, elementsPool: Element[]): string[] {
    if (mode === 'symbol') {
      return Array.from(new Set(elementsPool.map(e => e.symbol))).filter(s => s !== baseAnswer);
    } else if (mode === 'reverse') {
      const valMatch = elementsPool.find(e => e.name === baseAnswer)?.valency;
      return Array.from(new Set(elementsPool.filter(e => e.valency !== valMatch).map(e => e.name)));
    } else {
      return Array.from(new Set(elementsPool.map(e => e.valency))).filter(v => v !== baseAnswer && v !== 'Unknown');
    }
  }

  static generateBuilderQuestions(count: number, pool: Element[]): Question[] {
    const questions: Question[] = [];
    const positives = pool.filter(e => e.type === 'positive' && !e.valency.includes(','));
    const negatives = pool.filter(e => e.type === 'negative' && !e.valency.includes(','));

    // Limit pool to those with simple single valencies for Builder Mode if possible
    let combinedAttempts = 0;
    while (questions.length < count && combinedAttempts < count * 10) {
      combinedAttempts++;
      if (positives.length === 0 || negatives.length === 0) break;
      
      const pos = positives[Math.floor(Math.random() * positives.length)];
      const neg = negatives[Math.floor(Math.random() * negatives.length)];

      const posValFormat = pos.valency.replace('+', ''); // e.g. "2"
      const negValFormat = neg.valency.replace('-', ''); // e.g. "1"

      const posVal = parseInt(posValFormat) || 1;
      const negVal = parseInt(negValFormat) || 1;

      // Simplest cross multiply
      let formulaPosCount = negVal;
      let formulaNegCount = posVal;

      // simplify ratio (e.g., Mg2O2 -> MgO)
      if (formulaPosCount === formulaNegCount) {
        formulaPosCount = 1;
        formulaNegCount = 1;
      } else if (formulaPosCount % 2 === 0 && formulaNegCount % 2 === 0) {
        formulaPosCount /= 2;
        formulaNegCount /= 2;
      }

      const formatPart = (sym: string, count: number) => count > 1 ? `${sym}<sub>${count}</sub>` : sym;
      const correctAnswer = `${formatPart(pos.symbol, formulaPosCount)}${formatPart(neg.symbol, formulaNegCount)}`;

      // Generate some plausible wrong options
      const wrongOptions = [
        `${formatPart(pos.symbol, posVal)}${formatPart(neg.symbol, negVal)}`,
        `${formatPart(pos.symbol, negVal)}${formatPart(neg.symbol, posVal)}`,
        `${pos.symbol}${neg.symbol}`,
        `${formatPart(pos.symbol, negVal * 2)}${formatPart(neg.symbol, posVal)}`
      ].filter(o => o !== correctAnswer);

      // Strip sub tags for basic text if needed, but lets keep it rich or just use simple numbers
      // A better format for options without rich HTML in standard buttons:
      const formatPlain = (sym: string, count: number) => count > 1 ? `${sym}${count}` : sym;
      const plainCorrectAnswer = `${formatPlain(pos.symbol, formulaPosCount)}${formatPlain(neg.symbol, formulaNegCount)}`;
      
      const wrongPlainOptions = Array.from(new Set([
        `${formatPlain(pos.symbol, formulaNegCount)}${formatPlain(neg.symbol, formulaPosCount)}`, // swapped
        `${formatPlain(pos.symbol, posVal)}${formatPlain(neg.symbol, negVal)}`,
        `${pos.symbol}${neg.symbol}`,
        `${formatPlain(pos.symbol, negVal * 2)}${formatPlain(neg.symbol, posVal)}`
      ])).filter(o => o !== plainCorrectAnswer);

      // We need 3 wrong options
      let optPool = shuffleArray(wrongPlainOptions).slice(0, 3);
      if (optPool.length < 3) {
         // fallback
         optPool.push(`${pos.symbol}2${neg.symbol}3`);
         optPool.push(`${pos.symbol}3${neg.symbol}2`);
         optPool = Array.from(new Set(optPool)).filter(o => o !== plainCorrectAnswer).slice(0,3);
      }

      const text = `Given: ${pos.symbol}${pos.valency.replace('+','⁺')} and ${neg.symbol}${neg.valency.replace('-','⁻')} \nBuild the formula:`;
      
      let rawOptions = shuffleArray([plainCorrectAnswer, ...optPool]);
      const prefixesArr = ['A) ', 'B) ', 'C) ', 'D) '];
      const correctIndex = rawOptions.indexOf(plainCorrectAnswer);
      const options = rawOptions.map((opt, i) => `${prefixesArr[i]}${opt}`);
      
      questions.push({
        id: Math.random().toString(36).substring(7),
        text,
        correctAnswer: options[correctIndex],
        options,
        elementId: pos.id // Just associate with positive for tracking
      });
    }
    return questions;
  }

  static generateQuestions(mode: QuizMode, count: number = 10, range?: [number, number]): Question[] {
    let pool = [...elements];
    
    if (range) {
      pool = pool.filter(e => e.id >= range[0] && e.id <= range[1]);
    }
    
    if (mode === 'builder') {
      return this.generateBuilderQuestions(count, pool);
    }

    if (mode === 'positive') {
      pool = pool.filter(e => e.type === 'positive');
    } else if (mode === 'negative') {
      pool = pool.filter(e => e.type === 'negative');
    }

    if (mode === 'smart') {
      const stats = this.getStats();
      const unseen = pool.filter(e => !stats.seen.includes(e.id));
      const wrong = pool.filter(e => stats.wrong.includes(e.id));
      const rest = pool.filter(e => stats.seen.includes(e.id) && !stats.wrong.includes(e.id));
      
      // Heavily weight wrong answers (repeat them 3 times in pool)
      pool = [
        ...shuffleArray(unseen),
        ...shuffleArray(wrong),
        ...shuffleArray(wrong),
        ...shuffleArray(wrong),
        ...shuffleArray(rest)
      ];
    } else {
      pool = shuffleArray(pool);
    }
    
    // Survival and Time Attack might need more initial questions to not run out easily
    const targetCount = (mode === 'survival' || mode === 'timeattack') ? 50 : count;
    
    // Repeat pool if we need more questions than available
    while(pool.length > 0 && pool.length < targetCount) {
        pool = pool.concat(shuffleArray(pool));
    }

    const selectedElements = pool.slice(0, Math.min(targetCount, pool.length));
    
    return selectedElements.map(el => {
      let text = '';
      let correctAnswer = '';
      let optionsPool: string[] = [];

      if (mode === 'symbol') {
        text = `What is the symbol for ${el.name}?`;
        correctAnswer = el.symbol;
      } else if (mode === 'reverse') {
        text = `Which element has the valency ${el.valency}?`;
        correctAnswer = el.name;
      } else {
        text = `What are the typical valencies of ${el.name}?`;
        correctAnswer = el.valency;
      }

      optionsPool = this.getPredecessorOptions(mode, correctAnswer, elements);
      optionsPool = shuffleArray(optionsPool);
      let rawOptions = shuffleArray([correctAnswer, ...optionsPool.slice(0, 3)]);
      
      const prefixesArr = ['A) ', 'B) ', 'C) ', 'D) '];
      const correctIndex = rawOptions.indexOf(correctAnswer);
      const options = rawOptions.map((opt, i) => `${prefixesArr[i]}${opt}`);
      
      return {
        id: Math.random().toString(36).substring(7),
        text,
        correctAnswer: options[correctIndex],
        options,
        elementId: el.id
      };
    });
  }
}
