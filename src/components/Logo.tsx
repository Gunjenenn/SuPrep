export function CatIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#16a34a" />
      <path d="M46 56c7-1 10-6 8-12" fill="none" stroke="#0a0a0a" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M19 58c0-11 5-18 13-18s13 7 13 18z" fill="#0a0a0a" />
      <path d="M17 11l8 9.5a15 13 0 0 1 14 0L47 11l1.5 17a16.5 13.5 0 1 1-33 0z" fill="#0a0a0a" />
      <ellipse cx="25.5" cy="29" rx="3.6" ry="3" fill="#86efac" />
      <ellipse cx="38.5" cy="29" rx="3.6" ry="3" fill="#86efac" />
      <ellipse cx="25.5" cy="29" rx="1" ry="2.5" fill="#0a0a0a" />
      <ellipse cx="38.5" cy="29" rx="1" ry="2.5" fill="#0a0a0a" />
      <path d="M30.5 34.5h3l-1.5 1.8z" fill="#bbf7d0" />
    </svg>
  );
}

export function Logo({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CatIcon size={size} />
      <span className={`font-display text-xl font-black tracking-tight ${light ? "text-white" : ""}`}>
        Суу<span className={light ? "text-brand-400" : "text-brand-600"}>Prep</span>
      </span>
    </span>
  );
}
