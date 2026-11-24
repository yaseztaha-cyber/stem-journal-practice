declare module 'typo-js' {
  export default class Typo {
    constructor(lang: string, affData?: string, dicData?: string, options?: Record<string, unknown>);
    check(word: string): boolean;
    suggest(word: string, limit?: number): string[];
  }
}
