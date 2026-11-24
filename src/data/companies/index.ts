import type { Company } from '../../types';
import { leetcodeProblems } from '../problems/leetcode';

export const COMPANY_NOTE =
  'Problem associations are community-reported preparation recommendations, NOT verified interview logs. Companies change questions often — use these as pattern guides, not predictions.';

interface CompanyDef extends Omit<Company, 'problemIds' | 'note'> {
  tagName: string;
}

const companyDefs: CompanyDef[] = [
  {
    id: 'google',
    name: 'Google',
    tagName: 'Google',
    importantTopics: ['graphs', 'bfs-dfs', 'dynamic-programming', 'binary-search', 'arrays', 'strings', 'trees'],
    patterns: ['Graph traversal & topological sort', 'DP on strings/sequences', 'Binary search on answer', 'Sliding window + hashing', 'Heap streaming'],
    checklist: ['Clarify constraints aloud', 'Brute force → optimize', 'State time/space complexity', 'Dry-run a custom example', 'Explain trade-offs'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tagName: 'Amazon',
    importantTopics: ['arrays', 'strings', 'trees', 'graphs', 'heaps', 'dynamic-programming', 'design'],
    patterns: ['Top-K with heaps', 'BFS/DFS on grids', 'Sliding window', 'Intervals', 'LRU / design', 'Tree traversals'],
    checklist: ['Leadership Principles (STAR)', 'Medium array/tree/graph drills', 'One LLD problem', 'Clean runnable code', 'Discuss testing'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tagName: 'Microsoft',
    importantTopics: ['arrays', 'strings', 'linked-lists', 'trees', 'dynamic-programming', 'graphs'],
    patterns: ['In-place arrays', 'Linked list pointer work', 'Tree construction', 'Classic DP', 'Matrix problems'],
    checklist: ['Linked-list fluency', 'Tree problems with/without recursion', 'Classic DP formulations', 'Think aloud while coding', 'OOP/design basics'],
  },
  {
    id: 'meta',
    name: 'Meta',
    tagName: 'Meta',
    importantTopics: ['arrays', 'strings', 'trees', 'graphs', 'bfs-dfs', 'hashing', 'binary-search'],
    patterns: ['Two pointers / palindromes', 'Subarray sums + hash maps', 'BFS on graphs/trees', 'Binary search variants', 'Stack parsing'],
    checklist: ['Two mediums in ~35 minutes', 'Speed + correctness', 'Multiple approaches', 'Edge cases proactively', 'Behavioral stories'],
  },
  {
    id: 'apple',
    name: 'Apple',
    tagName: 'Apple',
    importantTopics: ['arrays', 'strings', 'linked-lists', 'trees', 'dynamic-programming', 'design'],
    patterns: ['Array/string manipulation', 'Linked lists', 'Tree traversals', 'Classic DP', 'Heap / streaming'],
    checklist: ['Strong fundamentals', 'Clean structured code', 'Explain design decisions', 'Team-relevant systems/OS', 'Ask thoughtful questions'],
  },
  {
    id: 'adobe',
    name: 'Adobe',
    tagName: 'Adobe',
    importantTopics: ['arrays', 'strings', 'linked-lists', 'math', 'dynamic-programming', 'bit-manipulation'],
    patterns: ['Two pointers', 'Bit tricks', 'Linked list reverse/cycle', 'Basic DP', 'String manipulation'],
    checklist: ['Easy→medium speed', 'OOP/DBMS/OS basics', 'Bit manipulation', 'Aptitude readiness', 'Complexity for every solution'],
  },
  {
    id: 'uber',
    name: 'Uber',
    tagName: 'Uber',
    importantTopics: ['graphs', 'bfs-dfs', 'dynamic-programming', 'design', 'heaps', 'tries'],
    patterns: ['Graph shortest paths', 'Design (LRU/LFU)', 'Trie + backtracking', 'Intervals/scheduling', 'Heaps'],
    checklist: ['Medium-hard graphs', 'One LLD problem', 'Concurrency/system discussions', 'Optimize past first solution', 'Edge-case testing aloud'],
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    tagName: 'Atlassian',
    importantTopics: ['design', 'hashing', 'graphs', 'trees', 'strings', 'dynamic-programming'],
    patterns: ['DS design (LRU, rate limiters)', 'Union-find / graph modelling', 'Trie search', 'Time-based KV stores', 'Heap scheduling'],
    checklist: ['Practical code-design round', 'Production-quality code', 'Extensibility & testing', 'Values-based behavioral', 'Machine-coding practice'],
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    tagName: 'Goldman Sachs',
    importantTopics: ['arrays', 'strings', 'dynamic-programming', 'math', 'hashing', 'sorting'],
    patterns: ['Array/string manipulation', 'Classic DP', 'Hashing for pairs', 'Math/probability puzzles', 'Stack parsing'],
    checklist: ['Aptitude & probability', 'DBMS/OS/CS fundamentals', 'Easy-medium speed', 'Clear “why GS” story', 'Complexity trade-offs'],
  },
  {
    id: 'jpmorgan',
    name: 'JPMorgan Chase',
    tagName: 'JPMorgan',
    importantTopics: ['arrays', 'strings', 'hashing', 'dynamic-programming', 'trees', 'math'],
    patterns: ['Array/string fundamentals', 'Hash map lookups', 'Basic DP', 'Tree traversals', 'Sorting + greedy'],
    checklist: ['Easy-medium fluency', 'CS fundamentals (OS/DBMS/networks)', 'Clean code under time pressure', 'Behavioral + situational', 'Project deep-dives'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    tagName: 'Salesforce',
    importantTopics: ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'design'],
    patterns: ['Tree/graph traversal', 'String problems', 'Classic DP', 'Design/API thinking', 'Hashing'],
    checklist: ['Medium DSA practice', 'OOP & design patterns', 'Explain trade-offs', 'Cloud/product curiosity', 'Behavioral stories'],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    tagName: 'Oracle',
    importantTopics: ['arrays', 'strings', 'linked-lists', 'trees', 'dynamic-programming', 'sql'],
    patterns: ['Linked lists', 'Array/string fundamentals', 'Tree traversals', 'Basic DP', 'SQL/DBMS'],
    checklist: ['DBMS/SQL/OS', 'Easy-medium DSA', 'Language fluency', 'Project explanations', 'Design basics'],
  },
  {
    id: 'walmart',
    name: 'Walmart',
    tagName: 'Walmart',
    importantTopics: ['arrays', 'strings', 'hashing', 'graphs', 'dynamic-programming', 'design'],
    patterns: ['Array/string problems', 'BFS/DFS on grids', 'Hash maps', 'Coin-change DP', 'Intervals'],
    checklist: ['Medium DSA', 'LLD/OOP basics', 'Machine-coding readiness', 'Know projects thoroughly', 'Behavioral examples'],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    tagName: 'Flipkart',
    importantTopics: ['arrays', 'trees', 'graphs', 'dynamic-programming', 'heaps', 'design'],
    patterns: ['Trees (LCA, serialization)', 'Graph BFS/DFS', 'DP (coin change, LIS)', 'Top-K heaps', 'Machine-coding / LLD'],
    checklist: ['Medium-hard trees/graphs', 'Machine-coding round', 'LLD patterns', 'HLD basics for senior', 'Project deep-dives'],
  },
  {
    id: 'paytm',
    name: 'Paytm',
    tagName: 'Paytm',
    importantTopics: ['arrays', 'strings', 'hashing', 'dynamic-programming', 'trees', 'math'],
    patterns: ['Array/string fundamentals', 'Hashing', 'Basic DP', 'Tree basics', 'Math/number problems'],
    checklist: ['Easy-medium speed', 'CS fundamentals', 'Clean I/O and edge cases', 'Project explanations', 'Aptitude readiness'],
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    tagName: 'ServiceNow',
    importantTopics: ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'design'],
    patterns: ['Medium DSA patterns', 'Tree/graph traversal', 'String problems', 'Design thinking', 'Hashing'],
    checklist: ['Medium problem fluency', 'Readable production-style code', 'OOP/design', 'Behavioral readiness', 'Ask product-aware questions'],
  },
  {
    id: 'deutsche-bank',
    name: 'Deutsche Bank',
    tagName: 'Deutsche Bank',
    importantTopics: ['arrays', 'strings', 'hashing', 'dynamic-programming', 'math', 'sorting'],
    patterns: ['Array/string manipulation', 'Hashing', 'Sorting + greedy', 'Basic DP', 'Math puzzles'],
    checklist: ['Easy-medium DSA', 'Aptitude & logic', 'CS fundamentals', 'Finance interest narrative', 'Clean code'],
  },
  {
    id: 'amex',
    name: 'American Express',
    tagName: 'American Express',
    importantTopics: ['arrays', 'strings', 'hashing', 'trees', 'dynamic-programming', 'sql'],
    patterns: ['Array/string problems', 'Hash maps', 'Tree basics', 'SQL-style thinking', 'Classic DP'],
    checklist: ['Easy-medium fluency', 'DBMS/SQL', 'Behavioral stories', 'Project ownership examples', 'Complexity explanation'],
  },
  {
    id: 'sprinklr',
    name: 'Sprinklr',
    tagName: 'Sprinklr',
    importantTopics: ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'design'],
    patterns: ['Medium-hard DSA', 'Trees & graphs', 'DP', 'String algorithms', 'Design/coding rounds'],
    checklist: ['Strong DSA depth', 'Speed on mediums', 'Machine-coding readiness', 'Explain optimizations', 'Project technical depth'],
  },
];

function resolveProblemIds(tagName: string): string[] {
  const exact = leetcodeProblems.filter((p) => p.companies?.includes(tagName)).map((p) => p.id);
  if (exact.length > 0) return exact;
  // Fallback: general interview prep set when company tag sparse in dataset
  return leetcodeProblems
    .filter((p) => p.sheetIds.includes('blind-75') || p.sheetIds.includes('grind-75'))
    .slice(0, 25)
    .map((p) => p.id);
}

export const companies: Company[] = companyDefs.map(({ tagName, ...def }) => ({
  ...def,
  problemIds: resolveProblemIds(tagName),
  note: COMPANY_NOTE,
}));

export const companyMap: Record<string, Company> = Object.fromEntries(companies.map((c) => [c.id, c]));
