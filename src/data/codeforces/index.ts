import type { CfLadder, CfResource } from '../../types';
import { codeforcesProblems } from '../problems/codeforces';

export const cfResources: CfResource[] = [
  {
    id: 'cf-edu',
    name: 'Codeforces EDU',
    description: 'Free interactive courses (binary search, segment tree, suffix structures, two pointers, and more) with lessons and practice.',
    url: 'https://codeforces.com/edu/courses',
  },
  {
    id: 'a2oj',
    name: 'A2OJ Ladders (archive)',
    description:
      'Community archive of the original A2 Online Judge rating ladders. Site availability may vary; treat as an optional reference.',
    url: 'https://a2oj.com/',
  },
  {
    id: 'cf-problemset',
    name: 'Codeforces Problemset',
    description: 'Full Codeforces archive — filter by rating, tags, and solved count.',
    url: 'https://codeforces.com/problemset',
  },
  {
    id: 'cph',
    name: "Competitive Programmer's Handbook",
    description: 'Free book by Antti Laaksonen covering essential competitive programming techniques.',
    url: 'https://cses.fi/book/book.pdf',
  },
  {
    id: 'cses',
    name: 'CSES Problem Set',
    description: 'Curated classic algorithm problems that complement the Competitive Programmer’s Handbook.',
    url: 'https://cses.fi/problemset/',
  },
  {
    id: 'cp-algorithms',
    name: 'CP-Algorithms',
    description: 'Detailed articles and implementations for algorithms and data structures used in competitive programming.',
    url: 'https://cp-algorithms.com/',
  },
];

interface LadderSpec {
  id: string;
  name: string;
  description: string;
  minRating: number;
  maxRating: number;
}

/** Six curated ladders matching the PLACEMENT OS preparation ranges. */
const ladderSpecs: LadderSpec[] = [
  {
    id: 'cf-beginner',
    name: 'Beginner (800–1000)',
    description: 'Implementation, simple math, and brute-force problems to build speed and contest confidence.',
    minRating: 800,
    maxRating: 1000,
  },
  {
    id: 'cf-fundamentals',
    name: 'Fundamentals (1000–1200)',
    description: 'Sorting, greedy basics, simple binary search / two pointers, and prefix sums.',
    minRating: 1000,
    maxRating: 1200,
  },
  {
    id: 'cf-intermediate',
    name: 'Intermediate (1200–1400)',
    description: 'Greedy with proofs, constructive algorithms, and introductory DP / graphs.',
    minRating: 1200,
    maxRating: 1400,
  },
  {
    id: 'cf-upper-intermediate',
    name: 'Upper Intermediate (1400–1600)',
    description: 'Stronger DP, number theory, graph traversal, and constructive problems.',
    minRating: 1400,
    maxRating: 1600,
  },
  {
    id: 'cf-advanced',
    name: 'Advanced (1600–1800)',
    description: 'DP variants, shortest paths, DSU, trees, and data-structure problems.',
    minRating: 1600,
    maxRating: 1800,
  },
  {
    id: 'cf-expert',
    name: 'Expert Preparation (1800+)',
    description: 'Harder DP, tree algorithms, segment trees, number theory, and advanced structures.',
    minRating: 1800,
    maxRating: 3500,
  },
];

export const cfLadders: CfLadder[] = ladderSpecs.map((spec) => ({
  ...spec,
  problemIds: codeforcesProblems
    .filter((p) => p.rating !== undefined && p.rating >= spec.minRating && p.rating <= spec.maxRating)
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0) || a.name.localeCompare(b.name))
    .map((p) => p.id),
}));

export const cfLadderMap: Record<string, CfLadder> = Object.fromEntries(cfLadders.map((l) => [l.id, l]));

export const CF_RATING_BUCKETS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000] as const;

export function ratingBucketLabel(rating: number): string {
  if (rating >= 2000) return '2000+';
  const bucket = CF_RATING_BUCKETS.find((b) => rating >= b && rating < b + 100);
  return bucket !== undefined ? String(bucket) : String(rating);
}
