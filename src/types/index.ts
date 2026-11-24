export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Platform = 'LeetCode' | 'Codeforces' | 'CSES' | 'GeeksforGeeks' | 'Other';
export type ProblemStatus = 'not_started' | 'attempted' | 'solved' | 'needs_revision' | 'bookmarked';
export type RevisionInterval = 1 | 3 | 7 | 14 | 30;
export type ThemeMode = 'dark' | 'light';

export interface Problem {
  id: string; // e.g. 'lc-1', 'cf-4A', 'cses-1068'
  name: string;
  platform: Platform;
  url: string;
  difficulty: Difficulty;
  topics: string[];
  companies?: string[];
  companyNote?: string; // e.g. 'community-reported' | 'general prep recommendation'
  sheetIds: string[];
  tags?: string[];
  contestId?: number;
  problemIndex?: string;
  rating?: number; // Codeforces rating
}

export interface Sheet {
  id: string;
  name: string;
  description: string;
  url: string;
  author: string;
  problemIds: string[];
  category: 'interview' | 'course' | 'patterns' | 'sql' | 'company' | 'cp';
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  concepts: string[];
  prerequisites: string[];
  order: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Company {
  id: string;
  name: string;
  importantTopics: string[];
  patterns: string[];
  problemIds: string[];
  checklist: string[];
  note: string; // clarify community vs verified
}

export interface CfResource {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface CfLadder {
  id: string;
  name: string;
  description: string;
  minRating: number;
  maxRating: number;
  problemIds: string[];
}

export interface ProblemProgress {
  status: ProblemStatus;
  bookmarked: boolean;
  notes: string;
  approach: string;
  bruteForce: string;
  optimized: string;
  timeComplexity: string;
  spaceComplexity: string;
  mistakes: string;
  observations: string;
  solutionLink: string;
  revisionNotes: string;
  code: string;
  lastSolvedAt?: string;
  lastAttemptedAt?: string;
  revisionCount: number;
  nextRevisionAt?: string;
  revisionInterval?: RevisionInterval;
  solvedDates: string[];
}

export interface PlannerEntry {
  date: string;
  notes: string;
  target: number;
  completed: number;
  sessionMinutes: number;
}

export interface AppSettings {
  theme: ThemeMode;
  defaultLanguage: string;
  dailyTarget: number;
  weeklyTarget: number;
}

export interface AppData {
  version: number;
  progress: Record<string, ProblemProgress>;
  settings: AppSettings;
  planner: Record<string, PlannerEntry>;
}
