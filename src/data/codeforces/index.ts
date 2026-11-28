import type { CfLadder, CfProblemSet, CfResource } from '../../types';
import { codeforcesProblems } from '../problems/codeforces';

function idsForSheet(sheetId: string): string[] {
  return codeforcesProblems
    .filter((p) => p.sheetIds.includes(sheetId))
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0) || a.name.localeCompare(b.name))
    .map((p) => p.id);
}

/** Famous CP sheets, blogs, editorials and tools — researched from CF community consensus. */
export const cfResources: CfResource[] = [
  {
    id: 'cp31',
    name: 'CP-31 Sheet (TLE Eliminators)',
    description:
      'Priyansh Agarwal’s hand-picked 31 problems per rating from 800–1900. Widely recommended as the modern replacement for random grind.',
    url: 'https://www.tle-eliminators.com/cp-sheet',
    category: 'sheet',
  },
  {
    id: 'striver-cp',
    name: "Striver's CP Sheet",
    description:
      'Topic-wise Codeforces sheet by takeUforward — implementation, math, binary search, graphs, DP, segment trees and more (~297 problems).',
    url: 'https://takeuforward.org/interview-experience/strivers-cp-sheet/',
    category: 'sheet',
  },
  {
    id: 'mostafa-saad',
    name: 'Mostafa Saad Junior Sheet',
    description:
      'Classic newcomer roadmap (blind-order CF-A → D3). Still strongly recommended for structured Div2 prep up to D.',
    url: 'https://codeforces.com/blog/entry/65546',
    category: 'sheet',
  },
  {
    id: 'a2oj',
    name: 'A2OJ Ladders (archive)',
    description:
      'The legendary rating ladders (<1300, 1300–1399, …). Use the client-side mirror; original a2oj.com may be offline.',
    url: 'https://earthshakira.github.io/a2oj-clientside/server/Ladders.html',
    category: 'sheet',
  },
  {
    id: 'cf-edu',
    name: 'Codeforces EDU',
    description: 'Free ITMO interactive courses: binary search, segment tree, two pointers, suffix structures, and more.',
    url: 'https://codeforces.com/edu/courses',
    category: 'course',
  },
  {
    id: 'cf-catalog',
    name: 'Codeforces Catalog',
    description: 'Official index of tutorials and blogs organised by topic — great for finding editorials and technique write-ups.',
    url: 'https://codeforces.com/catalog',
    category: 'editorial',
  },
  {
    id: 'cph',
    name: "Competitive Programmer's Handbook",
    description: 'Antti Laaksonen’s free book covering core CP techniques. Pair with the CSES problem set.',
    url: 'https://cses.fi/book/book.pdf',
    category: 'book',
  },
  {
    id: 'cses',
    name: 'CSES Problem Set',
    description: '300 classic problems in a sensible topic order. The standard complement to CPH.',
    url: 'https://cses.fi/problemset/',
    category: 'sheet',
  },
  {
    id: 'cp-algorithms',
    name: 'CP-Algorithms',
    description: 'e-maxx-eng: detailed articles and implementations for algorithms and data structures used in contests.',
    url: 'https://cp-algorithms.com/',
    category: 'book',
  },
  {
    id: 'usaco-guide',
    name: 'USACO Guide',
    description: 'Structured curriculum by level (Bronze→Platinum) with linked problems and explanations.',
    url: 'https://usaco.guide/',
    category: 'course',
  },
  {
    id: 'umnik-practice',
    name: 'How to practice (Um_nik)',
    description: 'Influential CF blog on deliberate practice: solve slightly above your level, upsolve, and avoid sheet addiction.',
    url: 'https://codeforces.com/blog/entry/98806',
    category: 'blog',
  },
  {
    id: 'radewoosh-practice',
    name: 'How to practice (Radewoosh)',
    description: 'Grandmaster take on practice habits, contest strategy and learning from editorials.',
    url: 'https://codeforces.com/blog/entry/98457',
    category: 'blog',
  },
  {
    id: 'superj6-guide',
    name: 'Effective Practice + Problem Solving Guide',
    description: 'Practical guide covering upsolving, editorial reading, and how to get stuck productively.',
    url: 'https://codeforces.com/blog/entry/111781',
    category: 'blog',
  },
  {
    id: 'jjang-expert',
    name: 'Tutorial and tips to reach Expert',
    description: 'Concrete roadmap-style tips aimed at climbing to Expert with contests + targeted practice.',
    url: 'https://codeforces.com/blog/entry/111177',
    category: 'blog',
  },
  {
    id: 'cf-problemset',
    name: 'Codeforces Problemset',
    description: 'Full archive — filter by rating, tags, and solved count when you want targeted practice.',
    url: 'https://codeforces.com/problemset',
    category: 'tool',
  },
  {
    id: 'kenkoooo',
    name: 'AtCoder Problems (kenkoooo)',
    description: 'Tracker for AtCoder — cleaner statements; pair with CF for variety.',
    url: 'https://kenkoooo.com/atcoder/',
    category: 'tool',
  },
];

const ladderSpecs = [
  {
    id: 'cf-beginner',
    name: 'Beginner (800–1000)',
    description: 'Implementation, simple math, and brute force — build speed and contest confidence.',
    minRating: 800,
    maxRating: 1000,
  },
  {
    id: 'cf-fundamentals',
    name: 'Fundamentals (1000–1200)',
    description: 'Sorting, greedy basics, binary search / two pointers, and prefix sums.',
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
    description: 'Harder DP, trees, segment trees, number theory, and advanced structures.',
    minRating: 1800,
    maxRating: 3500,
  },
] as const;

export const cfLadders: CfLadder[] = ladderSpecs.map((spec) => ({
  ...spec,
  problemIds: idsForSheet(spec.id),
}));

export const cfLadderMap: Record<string, CfLadder> = Object.fromEntries(cfLadders.map((l) => [l.id, l]));

const CP31_RATINGS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900] as const;

export const cfCp31Sets: CfProblemSet[] = CP31_RATINGS.map((rating) => ({
  id: `cp31-${rating}`,
  name: `CP-31 · ${rating}`,
  description: `31 hand-picked Codeforces problems at rating ${rating} from TLE Eliminators (Priyansh Agarwal).`,
  kind: 'cp31',
  source: 'TLE Eliminators / Priyansh Agarwal',
  url: 'https://www.tle-eliminators.com/cp-sheet',
  minRating: rating,
  maxRating: rating,
  problemIds: idsForSheet(`cp31-${rating}`),
}));

const topicSpecs: Array<{ id: string; name: string; description: string }> = [
  {
    id: 'cf-topic-greedy',
    name: 'Greedy',
    description: 'Exchange arguments, sorting + sweep, and “prove the greedy choice” classics.',
  },
  {
    id: 'cf-topic-dp',
    name: 'Dynamic Programming',
    description: 'Knapsack-style, digit DP warmups, and classic CF DP patterns.',
  },
  {
    id: 'cf-topic-binary-search',
    name: 'Binary Search',
    description: 'Binary search on answer, lower/upper bounds, and monotonic predicates.',
  },
  {
    id: 'cf-topic-graphs',
    name: 'Graphs',
    description: 'DFS/BFS, connectivity, topological ideas, and graph modeling.',
  },
  {
    id: 'cf-topic-trees',
    name: 'Trees',
    description: 'Tree DP, rerooting intros, and diameter / subtree techniques.',
  },
  {
    id: 'cf-topic-math',
    name: 'Math',
    description: 'Constructive math, counting, modular arithmetic, and formula spotting.',
  },
  {
    id: 'cf-topic-number-theory',
    name: 'Number Theory',
    description: 'GCD tricks, primes, divisors, and modular inverses at contest pace.',
  },
  {
    id: 'cf-topic-strings',
    name: 'Strings',
    description: 'String hashing, KMP-style ideas, and implementation-heavy string tasks.',
  },
  {
    id: 'cf-topic-dsu',
    name: 'DSU',
    description: 'Disjoint set union — connectivity, offline queries, and bipartite checks.',
  },
  {
    id: 'cf-topic-bitmasks',
    name: 'Bitmasks',
    description: 'Subset DP warmups, XOR tricks, and bitset-style thinking.',
  },
  {
    id: 'cf-topic-two-pointers',
    name: 'Two Pointers',
    description: 'Sliding windows, opposite pointers, and sorted-array pair patterns.',
  },
  {
    id: 'cf-topic-constructive',
    name: 'Constructive',
    description: 'Build the answer — permutations, grids, and “find any valid object”.',
  },
  {
    id: 'cf-topic-shortest-paths',
    name: 'Shortest Paths',
    description: 'Dijkstra, 0-1 BFS vibes, and graph modeling for distances.',
  },
  {
    id: 'cf-topic-data-structures',
    name: 'Data Structures',
    description: 'Segment trees, fenwick-style thinking, and offline structure problems.',
  },
];

export const cfTopicSets: CfProblemSet[] = topicSpecs.map((spec) => ({
  ...spec,
  kind: 'topic',
  source: 'Codeforces tags · top solved',
  url: 'https://codeforces.com/problemset',
  problemIds: idsForSheet(spec.id),
}));

export const cfClassicSet: CfProblemSet = {
  id: 'cf-classics',
  name: 'Legendary Classics',
  description: 'Timeless CF problems every serious contestant eventually meets.',
  kind: 'classic',
  source: 'Community classics',
  problemIds: idsForSheet('cf-classics'),
};

/** All organised in-app problem sets (ladders + CP-31 + topics + classics). */
export const cfProblemSets: CfProblemSet[] = [
  ...cfLadders.map(
    (l): CfProblemSet => ({
      id: l.id,
      name: l.name,
      description: l.description,
      kind: 'ladder',
      source: 'Popular rating-band practice (A2OJ-style)',
      minRating: l.minRating,
      maxRating: l.maxRating,
      problemIds: l.problemIds,
    }),
  ),
  ...cfCp31Sets,
  ...cfTopicSets,
  cfClassicSet,
];

export const cfProblemSetMap: Record<string, CfProblemSet> = Object.fromEntries(
  cfProblemSets.map((s) => [s.id, s]),
);

export const CF_RATING_BUCKETS = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000] as const;

export function ratingBucketLabel(rating: number): string {
  if (rating >= 2000) return '2000+';
  const bucket = CF_RATING_BUCKETS.find((b) => rating >= b && rating < b + 100);
  return bucket !== undefined ? String(bucket) : String(rating);
}

function problemsInRatingBucket(bucket: number) {
  return codeforcesProblems
    .filter((p) => {
      const r = p.rating ?? 0;
      return bucket >= 2000 ? r >= 2000 : r >= bucket && r < bucket + 100;
    })
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0) || a.name.localeCompare(b.name));
}

/** One browsable set per rating hundred — progress updates after CF sync. */
export const cfRatingSets: CfProblemSet[] = CF_RATING_BUCKETS.map((bucket): CfProblemSet => {
  const list = problemsInRatingBucket(bucket);
  return {
    id: `rating-${bucket}`,
    name: bucket >= 2000 ? 'Rating 2000+' : `Rating ${bucket}`,
    description:
      bucket >= 2000
        ? 'All catalog problems rated 2000 and above.'
        : `All catalog problems with Codeforces rating ${bucket}–${bucket + 99}.`,
    kind: 'ladder',
    source: 'Full catalog by rating',
    minRating: bucket,
    maxRating: bucket >= 2000 ? 3500 : bucket + 99,
    problemIds: list.map((p) => p.id),
  };
}).filter((s) => s.problemIds.length > 0);

// Merge rating sets into the lookup used by /codeforces/:id
for (const s of cfRatingSets) {
  cfProblemSetMap[s.id] = s;
}

/** Map CF rank title → accent colour for the sync card. */
export function cfRankColor(rank?: string): string {
  const r = (rank || '').toLowerCase();
  if (r.includes('legendary')) return '#ff0000';
  if (r.includes('international grandmaster') || r === 'grandmaster') return '#ff8c00';
  if (r.includes('international master') || r === 'master') return '#a00';
  if (r.includes('candidate master')) return '#a0a';
  if (r.includes('expert')) return '#00f';
  if (r.includes('specialist')) return '#0a8';
  if (r.includes('pupil')) return '#0a0';
  if (r.includes('newbie')) return '#808080';
  return 'var(--muted)';
}
