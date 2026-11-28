import { codeforcesProblems } from '../data/problems/codeforces';

export interface CodeforcesSyncResult {
  ok: true;
  handle: string;
  matchedIds: string[];
  fetchedCount: number;
  matchedCount: number;
  rating?: number;
  maxRating?: number;
  rank?: string;
}

export interface CodeforcesSyncError {
  ok: false;
  error: string;
}

type SyncOutcome = CodeforcesSyncResult | CodeforcesSyncError;

interface CfApiResponse<T> {
  status: 'OK' | 'FAILED';
  comment?: string;
  result?: T;
}

interface CfUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
}

interface CfProblemRef {
  contestId?: number;
  index?: string;
  problemsetName?: string;
}

interface CfSubmission {
  verdict?: string;
  problem?: CfProblemRef;
}

function problemKeyMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of codeforcesProblems) {
    if (p.contestId !== undefined && p.problemIndex) {
      map.set(`${p.contestId}${p.problemIndex}`.toUpperCase(), p.id);
    }
  }
  return map;
}

async function fetchCfApi<T>(pathAndQuery: string): Promise<T> {
  const url = `https://codeforces.com/api/${pathAndQuery}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as CfApiResponse<T>;
  if (data.status !== 'OK' || data.result === undefined) {
    throw new Error(data.comment || 'Codeforces API returned an error.');
  }
  return data.result;
}

/**
 * Pull accepted submissions for a public Codeforces handle via the official API
 * and map them onto this app's Codeforces problem ids.
 */
export async function fetchCodeforcesSolved(handle: string): Promise<SyncOutcome> {
  const clean = handle.trim().replace(/^@/, '');
  if (!clean) return { ok: false, error: 'Enter your Codeforces handle.' };
  if (!/^[A-Za-z0-9_.-]{2,24}$/.test(clean)) {
    return { ok: false, error: 'Handle looks invalid. Use your Codeforces handle only.' };
  }

  const encoded = encodeURIComponent(clean);

  let info: CfUserInfo | undefined;
  try {
    const users = await fetchCfApi<CfUserInfo[]>(`user.info?handles=${encoded}`);
    info = users[0];
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not reach Codeforces.';
    if (/not found|Bad handle|handles:/i.test(msg)) {
      return { ok: false, error: `Handle "${clean}" was not found on Codeforces.` };
    }
    return { ok: false, error: msg };
  }

  // Paginate status — CF allows count up to ~100000 but keep chunks modest
  const keys = new Set<string>();
  const pageSize = 10000;
  let from = 1;
  try {
    for (;;) {
      const batch = await fetchCfApi<CfSubmission[]>(
        `user.status?handle=${encoded}&from=${from}&count=${pageSize}`,
      );
      for (const sub of batch) {
        if (sub.verdict !== 'OK') continue;
        const contestId = sub.problem?.contestId;
        const index = sub.problem?.index;
        if (contestId === undefined || !index) continue;
        keys.add(`${contestId}${index}`.toUpperCase());
      }
      if (batch.length < pageSize) break;
      from += pageSize;
      if (from > 200000) break; // safety
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Failed to fetch submissions.',
    };
  }

  if (keys.size === 0) {
    return {
      ok: false,
      error: `No accepted submissions found for @${info?.handle ?? clean}.`,
    };
  }

  const map = problemKeyMap();
  const matchedIds: string[] = [];
  for (const key of keys) {
    const id = map.get(key);
    if (id) matchedIds.push(id);
  }

  return {
    ok: true,
    handle: info?.handle ?? clean,
    matchedIds: [...new Set(matchedIds)],
    fetchedCount: keys.size,
    matchedCount: matchedIds.length,
    rating: info?.rating,
    maxRating: info?.maxRating,
    rank: info?.rank,
  };
}
