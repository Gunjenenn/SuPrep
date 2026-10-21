export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold text-ink/55">{label}</div>
      <div className="mt-1 font-display text-3xl font-black tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-ink/45">{hint}</div>}
    </div>
  );
}

export function Bar({ label, accuracy, total }: { label: string; accuracy: number; total: number }) {
  const color = total === 0 ? "bg-brand-100" : accuracy >= 75 ? "bg-brand-600" : accuracy >= 50 ? "bg-brand-400" : "bg-amber-400";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-semibold">{label}</span>
        <span className="shrink-0 tabular-nums text-ink/60">
          {total === 0 ? "—" : `${accuracy}%`} <span className="text-xs text-ink/40">({total})</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-brand-50">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${total === 0 ? 0 : Math.max(accuracy, 3)}%` }} />
      </div>
    </div>
  );
}
