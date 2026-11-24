import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { buildHeatmap, heatLevel } from '../utils/stats';
import type { DateCounts } from '../utils/stats';
import { cn } from '../utils/cn';

interface HeatmapProps {
  counts: DateCounts;
  weeks?: number;
  className?: string;
}

const CELL = 11;
const GAP = 3;

export function Heatmap({ counts, weeks = 53, className }: HeatmapProps) {
  const data = useMemo(() => buildHeatmap(counts, weeks), [counts, weeks]);
  const colWidth = CELL + GAP;

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-max">
          <div className="relative ml-7 h-4 text-[10px] text-subtle" style={{ width: data.weeks.length * colWidth }}>
            {data.monthLabels.map((m) => (
              <span key={`${m.label}-${m.index}`} className="absolute" style={{ left: m.index * colWidth }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex">
            <div className="mr-2 flex w-5 flex-col text-[10px] text-subtle" style={{ gap: GAP }}>
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <span key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>
                  {d}
                </span>
              ))}
            </div>
            <div className="flex" style={{ gap: GAP }}>
              {data.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      className={cn('heat-cell', cell.future ? 'heat-future' : `heat-${heatLevel(cell.count)}`)}
                      title={
                        cell.future
                          ? undefined
                          : `${cell.count} solved on ${format(parseISO(cell.date), 'MMM d, yyyy')}`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-subtle">
        <span>{data.total} solves in the last year</span>
        <span className="flex items-center gap-1.5">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn('heat-cell', `heat-${l}`)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
