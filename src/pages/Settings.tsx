import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Download, FileSpreadsheet, Moon, Sun, Trash2, Upload } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useProgress } from '../context/ProgressContext';
import { cn } from '../utils/cn';
import { exportCSV, exportJSON, parseImport, readFileAsText } from '../utils/export';
import { solvedCount } from '../utils/stats';

const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C#', 'Kotlin'];

type Notice = { tone: 'ok' | 'error'; text: string } | null;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card">
      <div className="border-b border-border-soft px-4 py-3">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export function Settings() {
  const { data, progress, settings, updateSettings, resetProgress, importData } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ data: Parameters<typeof importData>[0]; count: number; name: string } | null>(null);

  const numberField = (key: 'dailyTarget' | 'weeklyTarget', label: string) => (
    <div>
      <label className="label" htmlFor={key}>
        {label}
      </label>
      <input
        id={key}
        type="number"
        min={1}
        max={500}
        className="input mono !w-28"
        value={settings[key]}
        onChange={(e) => {
          const n = Math.floor(Number(e.target.value));
          if (Number.isFinite(n) && n >= 1) updateSettings({ [key]: Math.min(n, 500) });
        }}
      />
    </div>
  );

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const result = parseImport(text);
      if (!result.ok) {
        setNotice({ tone: 'error', text: result.error });
        setPendingImport(null);
      } else {
        setNotice(null);
        setPendingImport({ data: result.data, count: result.problemCount, name: file.name });
      }
    } catch {
      setNotice({ tone: 'error', text: 'Could not read that file.' });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Preferences and data. Everything is stored in this browser only." />

      <div className="space-y-4">
        <Section title="Appearance">
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateSettings({ theme: t })}
                className={cn('btn', settings.theme === t && 'border-accent/60 text-accent')}
              >
                {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Workspace" description="Used as the label for the code editor in each problem.">
          <div>
            <label className="label" htmlFor="lang">
              Default language
            </label>
            <select id="lang" className="select !w-48" value={settings.defaultLanguage} onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Targets">
          <div className="flex flex-wrap gap-6">
            {numberField('dailyTarget', 'Daily target (problems)')}
            {numberField('weeklyTarget', 'Weekly target (problems)')}
          </div>
        </Section>

        <Section
          title="Data"
          description={`${Object.keys(progress).length} tracked problems · ${solvedCount(progress)} solved · ${Object.keys(data.planner).length} planner days`}
        >
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => exportJSON(data)}>
              <Download size={14} /> Export JSON
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Import JSON
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const n = exportCSV(progress);
                setNotice({ tone: 'ok', text: `Exported ${n} solved ${n === 1 ? 'problem' : 'problems'} to CSV.` });
              }}
            >
              <FileSpreadsheet size={14} /> Export solved CSV
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
          </div>

          {pendingImport && (
            <div className="rounded-lg border border-medium/30 bg-medium/5 p-3 text-xs">
              <p className="text-muted">
                Import <span className="mono text-fg">{pendingImport.name}</span> ({pendingImport.count} tracked problems)? This replaces all current progress, settings and planner data.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const ok = importData(pendingImport.data);
                    setNotice(ok ? { tone: 'ok', text: 'Data imported.' } : { tone: 'error', text: 'Import failed.' });
                    setPendingImport(null);
                  }}
                >
                  Replace my data
                </button>
                <button type="button" className="btn btn-sm" onClick={() => setPendingImport(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {notice && <p className={cn('text-xs', notice.tone === 'ok' ? 'text-accent' : 'text-hard')}>{notice.text}</p>}
        </Section>

        <Section title="Danger zone" description="Deletes all progress, notes, code and planner entries. Settings are kept.">
          {!confirmReset ? (
            <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>
              <Trash2 size={14} /> Reset all progress
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">This cannot be undone. Export a backup first.</span>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  setNotice({ tone: 'ok', text: 'All progress was reset.' });
                }}
              >
                Yes, delete everything
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
