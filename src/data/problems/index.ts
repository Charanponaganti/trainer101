import type { Problem } from '../../types';
import { leetcodeProblems } from './leetcode';
import { codeforcesProblems } from './codeforces';
import { csesProblems } from './cses';

export const problems: Problem[] = [...leetcodeProblems, ...codeforcesProblems, ...csesProblems];

export const problemMap: Record<string, Problem> = Object.fromEntries(problems.map((p) => [p.id, p]));

export const getProblem = (id: string): Problem | undefined => problemMap[id];

export { leetcodeProblems, codeforcesProblems, csesProblems };
