import type { Sheet } from '../../types';
import { problems } from '../problems';

type SheetMeta = Omit<Sheet, 'problemIds'>;

const sheetMeta: SheetMeta[] = [
  {
    id: 'striver-a2z',
    name: "Striver's A2Z DSA Course Sheet",
    description:
      'Step-by-step DSA course sheet by Striver (takeUforward) covering basics to advanced topics. Only problems with a LeetCode counterpart are mapped here (best-effort); the original sheet also links to GeeksforGeeks / Coding Ninjas.',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    author: 'Raj Vikramaditya (Striver) / takeUforward',
    category: 'course',
  },
  {
    id: 'striver-sde',
    name: "Striver's SDE Sheet",
    description:
      'Curated top coding interview problems by Striver, organised by day. LeetCode counterparts only (best-effort mapping of the original sheet).',
    url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    author: 'Raj Vikramaditya (Striver) / takeUforward',
    category: 'interview',
  },
  {
    id: 'blind-75',
    name: 'Blind 75',
    description: 'The classic 75 LeetCode questions curated by a Blind user, covering all core interview patterns. Includes 6 premium problems.',
    url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
    author: 'Yangshun Tay (original list posted on Blind)',
    category: 'interview',
  },
  {
    id: 'grind-75',
    name: 'Grind 75',
    description: 'Updated successor to Blind 75 with a time-based study schedule (75 questions over 8 weeks).',
    url: 'https://www.techinterviewhandbook.org/grind75/',
    author: 'Yangshun Tay / Tech Interview Handbook',
    category: 'interview',
  },
  {
    id: 'neetcode-150',
    name: 'NeetCode 150',
    description: 'NeetCode’s 150 curated problems grouped by pattern and ordered by dependency.',
    url: 'https://neetcode.io/practice',
    author: 'NeetCode',
    category: 'patterns',
  },
  {
    id: 'neetcode-250',
    name: 'NeetCode 250',
    description:
      'NeetCode 150 plus an extension of additional practice problems. The 150 core problems are exact; the extension is a best-effort mapping and may not match the live list one-to-one.',
    url: 'https://neetcode.io/practice?list=neetcode250',
    author: 'NeetCode',
    category: 'patterns',
  },
  {
    id: 'leetcode-top-150',
    name: 'LeetCode Top Interview 150',
    description: 'LeetCode’s official study plan of 150 must-do interview questions, grouped by topic.',
    url: 'https://leetcode.com/studyplan/top-interview-150/',
    author: 'LeetCode',
    category: 'interview',
  },
  {
    id: 'love-babbar-450',
    name: 'Love Babbar DSA 450',
    description:
      '450 DSA questions by Love Babbar. Only items with a LeetCode counterpart are mapped (best-effort); the original sheet mostly links to GeeksforGeeks.',
    url: 'https://github.com/loveBabbar/CodeHelp-DSA-Busted-Series',
    author: 'Love Babbar (CodeHelp)',
    category: 'course',
  },
  {
    id: 'sean-prashad',
    name: 'Sean Prashad LeetCode Patterns',
    description:
      'Pattern-based LeetCode question list that prioritises high-value problems per pattern. Best-effort mapping: Blind 75 plus commonly listed pattern problems.',
    url: 'https://seanprashad.com/leetcode-patterns/',
    author: 'Sean Prashad',
    category: 'patterns',
  },
  {
    id: 'tuf-interview',
    name: 'TUF Interview Preparation (Top Coding Interview Problems)',
    description: 'takeUforward’s interview-preparation problem list; links to the same Striver SDE sheet page and mirrors its LeetCode problems.',
    url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    author: 'takeUforward',
    category: 'interview',
  },
  {
    id: 'leetcode-sql-50',
    name: 'LeetCode SQL 50',
    description: 'LeetCode’s official Top SQL 50 study plan covering selects, joins, aggregates, subqueries and string functions.',
    url: 'https://leetcode.com/studyplan/top-sql-50/',
    author: 'LeetCode',
    category: 'sql',
  },
  {
    id: 'company-collections',
    name: 'Company-wise Collections',
    description:
      'Problems grouped by company for targeted preparation. Company tags are community-reported preparation recommendations, NOT verified interview logs; see the Companies page for per-company notes.',
    url: 'https://leetcode.com/problem-list/',
    author: 'Community-reported',
    category: 'company',
  },
  {
    id: 'cses-problemset',
    name: 'CSES Problem Set',
    description: 'Classic competitive-programming problem set (introductory, sorting, DP, graphs, range queries, trees, math and more) by Antti Laaksonen.',
    url: 'https://cses.fi/problemset/',
    author: 'Antti Laaksonen',
    category: 'cp',
  },
  {
    id: 'cp31',
    name: 'CP-31 Sheet (TLE Eliminators)',
    description:
      '372 hand-picked Codeforces problems — 31 per rating from 800 to 1900 — curated by Priyansh Agarwal. Open the Codeforces Arena for rating-wise breakdowns.',
    url: 'https://www.tle-eliminators.com/cp-sheet',
    author: 'Priyansh Agarwal / TLE Eliminators',
    category: 'cp',
  },
  {
    id: 'cf-beginner',
    name: 'CF Ladder · Beginner (800–1000)',
    description: 'Popular Codeforces problems in the 800–1000 band for building speed and contest confidence.',
    url: 'https://codeforces.com/problemset?tags=800-1000',
    author: 'Codeforces community',
    category: 'cp',
  },
  {
    id: 'cf-fundamentals',
    name: 'CF Ladder · Fundamentals (1000–1200)',
    description: 'Sorting, greedy, binary search and two-pointer fundamentals on Codeforces.',
    url: 'https://codeforces.com/problemset?tags=1000-1200',
    author: 'Codeforces community',
    category: 'cp',
  },
  {
    id: 'cf-intermediate',
    name: 'CF Ladder · Intermediate (1200–1400)',
    description: 'Constructive, greedy proofs, and intro DP / graphs for climbing toward Specialist.',
    url: 'https://codeforces.com/problemset?tags=1200-1400',
    author: 'Codeforces community',
    category: 'cp',
  },
  {
    id: 'cf-upper-intermediate',
    name: 'CF Ladder · Upper Intermediate (1400–1600)',
    description: 'Stronger DP, number theory and graph problems for Expert-bound training.',
    url: 'https://codeforces.com/problemset?tags=1400-1600',
    author: 'Codeforces community',
    category: 'cp',
  },
  {
    id: 'cf-advanced',
    name: 'CF Ladder · Advanced (1600–1800)',
    description: 'DSU, trees, shortest paths and harder DP — Candidate Master prep territory.',
    url: 'https://codeforces.com/problemset?tags=1600-1800',
    author: 'Codeforces community',
    category: 'cp',
  },
  {
    id: 'cf-expert',
    name: 'CF Ladder · Expert (1800+)',
    description: 'Harder structures, trees and advanced DP for late Expert / early CM practice.',
    url: 'https://codeforces.com/problemset?tags=1800-3500',
    author: 'Codeforces community',
    category: 'cp',
  },
];

const bySheet = new Map<string, string[]>();
for (const p of problems) {
  for (const sid of p.sheetIds) {
    const list = bySheet.get(sid);
    if (list) list.push(p.id);
    else bySheet.set(sid, [p.id]);
  }
}

export const sheets: Sheet[] = sheetMeta.map((meta) => ({
  ...meta,
  problemIds:
    meta.id === 'company-collections'
      ? problems.filter((p) => p.companies && p.companies.length > 0).map((p) => p.id)
      : (bySheet.get(meta.id) ?? []),
}));

export const sheetMap: Record<string, Sheet> = Object.fromEntries(sheets.map((s) => [s.id, s]));

export const getSheet = (id: string): Sheet | undefined => sheetMap[id];
