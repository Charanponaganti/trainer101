/**
 * Builds an expanded Codeforces catalog from:
 * - Official CF problemset API
 * - CP-31 (TLE Eliminators) problem names by rating
 * - Existing classics + topic / ladder organization
 *
 * Run: node scripts/build-cf-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const TAG_TO_TOPICS = {
  'brute force': ['recursion'],
  math: ['math'],
  'number theory': ['number-theory', 'math'],
  combinatorics: ['math'],
  geometry: ['math'],
  probabilities: ['math'],
  implementation: ['arrays'],
  constructive: ['arrays'],
  'constructive algorithms': ['arrays'],
  strings: ['strings'],
  'string suffix structures': ['strings'],
  greedy: ['greedy'],
  sortings: ['sorting'],
  'binary search': ['binary-search'],
  'two pointers': ['two-pointers'],
  hashing: ['hashing'],
  'bitmasks': ['bit-manipulation'],
  dp: ['dynamic-programming'],
  trees: ['trees'],
  'dfs and similar': ['bfs-dfs'],
  graphs: ['graphs'],
  'shortest paths': ['advanced-graphs', 'graphs'],
  flows: ['advanced-graphs'],
  'graph matchings': ['graphs'],
  dsu: ['union-find'],
  'data structures': ['arrays'],
  'divide and conquer': ['recursion'],
  'meet-in-the-middle': ['recursion'],
  schedules: ['greedy'],
  'ternary search': ['binary-search'],
  matrices: ['arrays'],
  'expression parsing': ['strings'],
  games: ['math'],
  'chinese remainder theorem': ['number-theory'],
  fft: ['math'],
  '2-sat': ['graphs'],
};

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function difficultyFromRating(rating) {
  if (rating <= 1200) return 'Easy';
  if (rating <= 1600) return 'Medium';
  return 'Hard';
}

function topicsFromTags(tags) {
  const set = new Set();
  for (const tag of tags) {
    const mapped = TAG_TO_TOPICS[tag.toLowerCase()];
    if (mapped) mapped.forEach((t) => set.add(t));
  }
  if (set.size === 0) set.add('arrays');
  return [...set];
}

function ladderIdForRating(rating) {
  if (rating <= 1000) return 'cf-beginner';
  if (rating <= 1200) return 'cf-fundamentals';
  if (rating <= 1400) return 'cf-intermediate';
  if (rating <= 1600) return 'cf-upper-intermediate';
  if (rating <= 1800) return 'cf-advanced';
  return 'cf-expert';
}

function cp31SheetId(rating) {
  return `cp31-${rating}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function pickBestMatch(candidates, targetName) {
  const target = normalizeName(targetName);
  if (!candidates.length) return null;
  let exact = candidates.find((c) => normalizeName(c.name) === target);
  if (exact) return exact;
  // fuzzy: contains / contained
  exact = candidates.find((c) => {
    const n = normalizeName(c.name);
    return n.includes(target) || target.includes(n);
  });
  if (exact) return exact;
  // token overlap
  const tokens = new Set(target.split(' ').filter((t) => t.length > 2));
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const n = normalizeName(c.name);
    const ct = n.split(' ').filter((t) => t.length > 2);
    const overlap = ct.filter((t) => tokens.has(t)).length;
    const score = overlap / Math.max(tokens.size, ct.length, 1);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= 0.5 ? best : null;
}

async function main() {
  console.log('Fetching Codeforces problemset…');
  const api = await fetchJson('https://codeforces.com/api/problemset.problems');
  if (api.status !== 'OK') throw new Error('CF API failed');

  const problems = api.result.problems;
  const stats = api.result.problemStatistics;
  const solvedMap = new Map(stats.map((s) => [`${s.contestId}-${s.index}`, s.solvedCount ?? 0]));

  const byRating = new Map();
  const byKey = new Map();
  for (const p of problems) {
    if (!p.rating || !p.contestId || !p.index) continue;
    // skip gym / special
    if (p.contestId >= 100000) continue;
    const key = `${p.contestId}${p.index}`;
    byKey.set(key, p);
    if (!byRating.has(p.rating)) byRating.set(p.rating, []);
    byRating.get(p.rating).push(p);
  }

  const cp31Names = JSON.parse(fs.readFileSync(path.join(__dirname, 'cp31-names.json'), 'utf8'));
  const selected = new Map(); // id -> meta
  const unmatchedCp31 = [];

  function addProblem(p, sheetIds) {
    const id = `cf-${p.contestId}${p.index}`;
    const existing = selected.get(id);
    if (existing) {
      const merged = new Set([...existing.sheetIds, ...sheetIds]);
      existing.sheetIds = [...merged];
      return existing;
    }
    const entry = {
      id,
      name: p.name,
      platform: 'Codeforces',
      url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      difficulty: difficultyFromRating(p.rating),
      topics: topicsFromTags(p.tags || []),
      sheetIds: [...new Set(sheetIds)],
      tags: p.tags || [],
      contestId: p.contestId,
      problemIndex: p.index,
      rating: p.rating,
      solvedCount: solvedMap.get(`${p.contestId}-${p.index}`) ?? 0,
    };
    selected.set(id, entry);
    return entry;
  }

  // 1) CP-31 matches (unique per rating band)
  console.log('Matching CP-31…');
  for (const [ratingStr, names] of Object.entries(cp31Names)) {
    const rating = Number(ratingStr);
    const used = new Set();
    const pool = (byRating.get(rating) || []).slice();
    for (const name of names) {
      const available = pool.filter((p) => !used.has(`${p.contestId}${p.index}`));
      const match = pickBestMatch(available, name);
      if (!match) {
        unmatchedCp31.push({ rating, name });
        continue;
      }
      used.add(`${match.contestId}${match.index}`);
      addProblem(match, [cp31SheetId(rating), ladderIdForRating(rating), 'cp31']);
    }
  }
  console.log(`CP-31 matched: ${[...selected.values()].filter((p) => p.sheetIds.includes('cp31')).length}, unmatched: ${unmatchedCp31.length}`);
  if (unmatchedCp31.length) {
    console.log('Sample unmatched:', unmatchedCp31.slice(0, 15));
  }

  // 2) Popular rating-band classics (A2OJ-style top solved)
  console.log('Building rating ladders…');
  const ladderBands = [
    [800, 1000, 'cf-beginner'],
    [1000, 1200, 'cf-fundamentals'],
    [1200, 1400, 'cf-intermediate'],
    [1400, 1600, 'cf-upper-intermediate'],
    [1600, 1800, 'cf-advanced'],
    [1800, 3500, 'cf-expert'],
  ];
  for (const [lo, hi, sheetId] of ladderBands) {
    const pool = problems
      .filter((p) => p.rating >= lo && p.rating <= hi && p.contestId < 100000)
      .map((p) => ({ p, solved: solvedMap.get(`${p.contestId}-${p.index}`) ?? 0 }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, sheetId === 'cf-expert' ? 60 : 50);
    for (const { p } of pool) addProblem(p, [sheetId, `a2oj-style`]);
  }

  // 3) Topic sets — top solved problems per primary CF tag
  console.log('Building topic sets…');
  const topicSpecs = [
    { id: 'cf-topic-greedy', tag: 'greedy', label: 'Greedy' },
    { id: 'cf-topic-dp', tag: 'dp', label: 'Dynamic Programming' },
    { id: 'cf-topic-binary-search', tag: 'binary search', label: 'Binary Search' },
    { id: 'cf-topic-graphs', tag: 'graphs', label: 'Graphs' },
    { id: 'cf-topic-trees', tag: 'trees', label: 'Trees' },
    { id: 'cf-topic-math', tag: 'math', label: 'Math' },
    { id: 'cf-topic-number-theory', tag: 'number theory', label: 'Number Theory' },
    { id: 'cf-topic-strings', tag: 'strings', label: 'Strings' },
    { id: 'cf-topic-dsu', tag: 'dsu', label: 'DSU' },
    { id: 'cf-topic-bitmasks', tag: 'bitmasks', label: 'Bitmasks' },
    { id: 'cf-topic-two-pointers', tag: 'two pointers', label: 'Two Pointers' },
    { id: 'cf-topic-constructive', tag: 'constructive algorithms', label: 'Constructive' },
    { id: 'cf-topic-shortest-paths', tag: 'shortest paths', label: 'Shortest Paths' },
    { id: 'cf-topic-data-structures', tag: 'data structures', label: 'Data Structures' },
  ];

  for (const spec of topicSpecs) {
    const pool = problems
      .filter(
        (p) =>
          p.rating &&
          p.rating >= 800 &&
          p.rating <= 2200 &&
          p.contestId < 100000 &&
          (p.tags || []).map((t) => t.toLowerCase()).includes(spec.tag),
      )
      .map((p) => ({ p, solved: solvedMap.get(`${p.contestId}-${p.index}`) ?? 0 }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 40);
    for (const { p } of pool) addProblem(p, [spec.id, 'cf-topics']);
  }

  // 4) Keep a few legendary classics always
  const classics = [
    '4A', '71A', '231A', '282A', '50A', '263A', '112A', '339A', '281A', '266A',
    '158A', '236A', '791A', '977A', '546A', '617A', '1A', '58A', '122A', '96A',
    '230A', '337A', '492B', '479C', '580C', '455A', '489C', '520B', '279B',
    '20C', '466C', '474D', '580D', '706D',
  ];
  for (const key of classics) {
    const p = byKey.get(key);
    if (p?.rating) addProblem(p, [ladderIdForRating(p.rating), 'cf-classics']);
  }

  const list = [...selected.values()].sort(
    (a, b) => (a.rating ?? 0) - (b.rating ?? 0) || a.contestId - b.contestId || a.problemIndex.localeCompare(b.problemIndex),
  );

  // Strip solvedCount from exported problems (internal only)
  const exportProblems = list.map(({ solvedCount, ...rest }) => rest);

  const outProblems = path.join(root, 'src/data/problems/codeforces.ts');
  const header = `import type { Problem } from '../../types';

// Auto-generated by scripts/build-cf-catalog.mjs
// Sources: Codeforces API + CP-31 (TLE Eliminators) + popular rating/topic ladders.
// Difficulty: <=1200 Easy, <=1600 Medium, else Hard.

export const codeforcesProblems: Problem[] = `;

  fs.writeFileSync(outProblems, `${header}${JSON.stringify(exportProblems, null, 2)};\n`);
  console.log(`Wrote ${exportProblems.length} problems -> ${outProblems}`);

  // Meta for sheets / sets used by codeforces/index.ts
  const cp31Ratings = Object.keys(cp31Names).map(Number).sort((a, b) => a - b);
  const meta = {
    generatedAt: new Date().toISOString(),
    totalProblems: exportProblems.length,
    cp31Ratings,
    unmatchedCp31,
    topicSpecs: topicSpecs.map(({ id, label, tag }) => ({ id, label, tag })),
    ladderBands: ladderBands.map(([minRating, maxRating, id]) => ({ id, minRating, maxRating })),
  };
  fs.writeFileSync(path.join(__dirname, 'cf-catalog-meta.json'), JSON.stringify(meta, null, 2));

  // Sheet id counts
  const counts = {};
  for (const p of exportProblems) {
    for (const s of p.sheetIds) counts[s] = (counts[s] ?? 0) + 1;
  }
  console.log('Sheet counts:', counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
