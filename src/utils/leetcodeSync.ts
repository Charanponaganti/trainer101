import { leetcodeProblems } from '../data/problems/leetcode';
import { leetCodeSlug } from './problemLinks';

const ALFA = 'https://alfa-leetcode-api.onrender.com';

export interface LeetCodeSyncResult {
  ok: true;
  username: string;
  matchedIds: string[];
  fetchedCount: number;
  matchedCount: number;
}

export interface LeetCodeSyncError {
  ok: false;
  error: string;
}

type SyncOutcome = LeetCodeSyncResult | LeetCodeSyncError;

interface AcSubmission {
  title?: string;
  titleSlug?: string;
  timestamp?: string;
}

function slugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of leetcodeProblems) {
    const slug = leetCodeSlug(p.url);
    if (slug) map.set(slug.toLowerCase(), p.id);
  }
  return map;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function collectSlugs(payload: unknown): string[] {
  const slugs = new Set<string>();

  const add = (s: unknown) => {
    if (typeof s === 'string' && s.trim()) slugs.add(s.trim().toLowerCase());
  };

  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;

  // alfa: { submission: [{ titleSlug }] } or array
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(obj.submission)
      ? obj.submission
      : Array.isArray(obj.acSubmission)
        ? obj.acSubmission
        : Array.isArray(obj.recentAcSubmissionList)
          ? obj.recentAcSubmissionList
          : Array.isArray(obj.solvedProblem)
            ? obj.solvedProblem
            : [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as AcSubmission & Record<string, unknown>;
    add(row.titleSlug);
    add(row.title_slug);
    add(row.slug);
  }

  // some APIs nest matchedUser / submitStats
  if (Array.isArray(obj.matchedUserQuestions)) {
    for (const q of obj.matchedUserQuestions) {
      if (q && typeof q === 'object') add((q as { titleSlug?: string }).titleSlug);
    }
  }

  return [...slugs];
}

/**
 * Pull accepted submissions for a public LeetCode username via a community API
 * and map them onto this app's LeetCode problem ids.
 *
 * Note: LeetCode has no official browser CORS API. Sync uses a public proxy API
 * and polls while the app is open — not a guaranteed LeetCode webhook.
 */
export async function fetchLeetCodeSolved(username: string): Promise<SyncOutcome> {
  const clean = username.trim().replace(/^@/, '');
  if (!clean) return { ok: false, error: 'Enter a LeetCode username.' };
  if (!/^[A-Za-z0-9_-]{2,40}$/.test(clean)) {
    return { ok: false, error: 'Username looks invalid. Use your LeetCode handle only.' };
  }

  const encoded = encodeURIComponent(clean);
  const endpoints = [
    `${ALFA}/${encoded}/acSubmission?limit=100`,
    `${ALFA}/${encoded}/acSubmission?limit=50`,
  ];

  let slugs: string[] = [];
  let lastError = 'Could not reach LeetCode sync API.';

  for (const url of endpoints) {
    try {
      const data = await fetchJson(url);
      const found = collectSlugs(data);
      if (found.length > slugs.length) slugs = found;
      if (slugs.length > 0) break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Network error talking to sync API.';
    }
  }

  // Fallback profile endpoint (may only give counts, but sometimes includes lists)
  if (slugs.length === 0) {
    try {
      const profile = await fetchJson(`${ALFA}/${encoded}`);
      slugs = collectSlugs(profile);
    } catch {
      // keep lastError
    }
  }

  if (slugs.length === 0) {
    return {
      ok: false,
      error: `${lastError} Make sure the username is public, then try Sync again.`,
    };
  }

  const map = slugMap();
  const matchedIds: string[] = [];
  for (const slug of slugs) {
    const id = map.get(slug);
    if (id) matchedIds.push(id);
  }

  return {
    ok: true,
    username: clean,
    matchedIds: [...new Set(matchedIds)],
    fetchedCount: slugs.length,
    matchedCount: matchedIds.length,
  };
}
