import type { Problem } from '../types';

export interface ProblemLink {
  label: string;
  url: string;
}

/** Extract LeetCode title slug from a problem URL. */
export function leetCodeSlug(url: string): string | null {
  const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  return m ? m[1] : null;
}

/** Public links for a problem: statement, editorial, solutions community page, plus optional personal link. */
export function getProblemLinks(problem: Problem, personalSolutionLink?: string): ProblemLink[] {
  const links: ProblemLink[] = [{ label: 'Problem', url: problem.url }];

  if (problem.platform === 'LeetCode') {
    const slug = leetCodeSlug(problem.url);
    if (slug) {
      const base = `https://leetcode.com/problems/${slug}`;
      links.push({ label: 'Editorial', url: `${base}/editorial/` });
      links.push({ label: 'Solutions', url: `${base}/solutions/` });
    }
  } else if (problem.platform === 'Codeforces') {
    links.push({ label: 'Problemset', url: 'https://codeforces.com/problemset' });
  } else if (problem.platform === 'CSES') {
    links.push({ label: 'CSES', url: 'https://cses.fi/problemset/' });
  }

  const personal = personalSolutionLink?.trim();
  if (personal && /^https?:\/\//i.test(personal)) {
    links.push({ label: 'My solution', url: personal });
  }

  return links;
}
