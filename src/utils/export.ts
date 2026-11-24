import { format } from 'date-fns';
import { problemMap } from '../data/problems';
import { topicMap } from '../data/topics';
import type { AppData, ProblemProgress } from '../types';
import { normalizeData } from './storage';

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJSON(data: AppData): void {
  download(`placement-os-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export type ImportResult = { ok: true; data: AppData; problemCount: number } | { ok: false; error: string };

export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }
  const data = normalizeData(raw);
  if (!data) return { ok: false, error: 'File does not look like a PLACEMENT OS backup (missing "progress").' };
  return { ok: true, data, problemCount: Object.keys(data.progress).length };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsText(file);
  });
}

function csvCell(value: string | number | undefined): string {
  const s = value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildSolvedCSV(progress: Record<string, ProblemProgress>): string {
  const header = [
    'id',
    'name',
    'platform',
    'difficulty',
    'topics',
    'url',
    'last_solved_at',
    'solved_dates',
    'revision_count',
    'time_complexity',
    'space_complexity',
  ];
  const rows: string[] = [header.join(',')];
  for (const [id, p] of Object.entries(progress)) {
    if (p.status !== 'solved') continue;
    const problem = problemMap[id];
    rows.push(
      [
        id,
        problem?.name ?? id,
        problem?.platform ?? '',
        problem?.difficulty ?? '',
        (problem?.topics ?? []).map((t) => topicMap[t]?.name ?? t).join('; '),
        problem?.url ?? '',
        p.lastSolvedAt ?? '',
        p.solvedDates.join('; '),
        p.revisionCount,
        p.timeComplexity,
        p.spaceComplexity,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return rows.join('\n');
}

export function exportCSV(progress: Record<string, ProblemProgress>): number {
  const csv = buildSolvedCSV(progress);
  download(`placement-os-solved-${format(new Date(), 'yyyy-MM-dd')}.csv`, csv, 'text/csv');
  return csv.split('\n').length - 1;
}
