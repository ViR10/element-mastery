import { elements, Element } from '../data/elements';

export type QuizMode = 'positive' | 'negative' | 'mixed' | 'reverse' | 'symbol' | 'smart';

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
      return stats ? JSON.parse(stats) : { seen: [], wrong: [] };
    } catch {
      return { seen: [], wrong: [] };
    }
  }

  static recordAnswer(elementId: number, isCorrect: boolean) {
    try {
      const stats = this.getStats();
      if (!stats.seen.includes(elementId)) {
        stats.seen.push(elementId);
      }
      if (!isCorrect && !stats.wrong.includes(elementId)) {
        stats.wrong.push(elementId);
      } else if (isCorrect && stats.wrong.includes(elementId)) {
        stats.wrong = stats.wrong.filter((id: number) => id !== elementId);
      }
      localStorage.setItem('elementStats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }

  static generateQuestions(mode: QuizMode, count: number = 10): Question[] {
    let pool = [...elements];
    
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
      
      pool = [
        ...shuffleArray(unseen),
        ...shuffleArray(wrong),
        ...shuffleArray(rest)
      ];
    } else {
      pool = shuffleArray(pool);
    }
    
    const selectedElements = pool.slice(0, Math.min(count, pool.length));
    
    return selectedElements.map(el => {
      let text = '';
      let correctAnswer = '';
      let optionsPool: string[] = [];

      if (mode === 'symbol') {
        text = `What is the symbol for ${el.name}?`;
        correctAnswer = el.symbol;
        optionsPool = Array.from(new Set(elements.map(e => e.symbol))).filter(s => s !== correctAnswer);
      } else if (mode === 'reverse') {
        text = `Which element has the valency ${el.valency}?`;
        correctAnswer = el.name;
        // Filter out elements that share the exact same valency string to avoid ambiguous correct options
        optionsPool = Array.from(new Set(elements.filter(e => e.valency !== el.valency).map(e => e.name)));
      } else {
        // Default: ask for valency
        text = `What are the typical valencies of ${el.name}?`;
        correctAnswer = el.valency;
        optionsPool = Array.from(new Set(elements.map(e => e.valency))).filter(v => v !== correctAnswer);
      }

      optionsPool = shuffleArray(optionsPool);
      let rawOptions = shuffleArray([correctAnswer, ...optionsPool.slice(0, 3)]);
      
      // Prefix with A) B) C) D)
      const prefixesArr = ['A) ', 'B) ', 'C) ', 'D) '];
      const correctIndex = rawOptions.indexOf(correctAnswer);
      const options = rawOptions.map((opt, i) => `${prefixesArr[i]}${opt}`);
      
      // Track modified correct answer to match exactly
      const finalCorrectAnswer = options[correctIndex];

      return {
        id: Math.random().toString(36).substring(7),
        text,
        correctAnswer: finalCorrectAnswer,
        options,
        elementId: el.id
      };
    });
  }
}
