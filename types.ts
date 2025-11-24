export type Gender = 'M' | 'F';

export interface HeartRateZone {
  id: string;
  name: string;
  rangePercent: string; // e.g. "50-60%"
  minPct: number;
  maxPct: number;
  minBpm: number;
  maxBpm: number;
  description: string;
  duration: string;
  goal: string;
  color: string;
  textColor: string;
  isTarget: boolean;
}

export interface UserInput {
  age: number | '';
  gender: Gender;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
}
