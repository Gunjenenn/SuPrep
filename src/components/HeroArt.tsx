/** Дашбоардын дээд талын арын зураг: ногоон толгодууд, толгой дээр суусан хар муур. */
export function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-100 via-brand-50 to-paper" />
      <svg className="absolute bottom-0 left-0 h-48 w-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M0 120 C 180 60, 320 70, 470 110 S 760 160, 900 100 S 1120 40, 1200 70 V200 H0Z" fill="#d9fbe3" />
        <path d="M0 150 C 160 110, 330 120, 520 150 S 820 180, 1000 140 S 1150 120, 1200 130 V200 H0Z" fill="#ecfdf1" />
        <path d="M0 185 C 250 165, 500 175, 760 185 S 1100 190, 1200 182 V200 H0Z" fill="#f5faf6" />
      </svg>
      {/* муур (баруун дээд хэсэгт, толгой дээр) */}
      <svg className="absolute bottom-16 right-[6%] hidden h-24 w-24 opacity-90 md:block" viewBox="0 0 64 64">
        <path d="M46 56c7-1 10-6 8-12" fill="none" stroke="#0c1a12" strokeWidth="4" strokeLinecap="round" />
        <path d="M19 58c0-11 5-18 13-18s13 7 13 18z" fill="#0c1a12" />
        <path d="M17 11l8 9.5a15 13 0 0 1 14 0L47 11l1.5 17a16.5 13.5 0 1 1-33 0z" fill="#0c1a12" />
        <ellipse cx="25.5" cy="29" rx="3.6" ry="3" fill="#86efac" />
        <ellipse cx="38.5" cy="29" rx="3.6" ry="3" fill="#86efac" />
        <ellipse cx="25.5" cy="29" rx="1" ry="2.5" fill="#0c1a12" />
        <ellipse cx="38.5" cy="29" rx="1" ry="2.5" fill="#0c1a12" />
      </svg>
      <div className="absolute left-[12%] top-10 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute right-[30%] top-6 h-16 w-40 rounded-full bg-white/60 blur-xl" />
    </div>
  );
}
