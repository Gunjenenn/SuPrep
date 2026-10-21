const P = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  chat: "M4 5h16v11H8l-4 4zM8 9h8M8 12h5",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  chart: "M5 20V11M12 20V5M19 20v-6",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  timer: "M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  flame: "M12 22c4 0 7-3 7-7 0-5-4-7-5-12-2 3-1 5-3 6-1-1-1-2-1-3-3 2-4 5-4 9 0 4 3 7 6 7z",
  check: "M5 12.5 10 17 19 7",
  pencil: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
} as const;

export type IconName = keyof typeof P;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}
