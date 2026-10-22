import type { ReactNode } from 'react';

function Icon({ children, className = 'h-4 w-4' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const PlayIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M7 5v14l11-7L7 5Z" />
  </Icon>
);

export const BoltIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
  </Icon>
);

export const BellIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
);

export const PencilIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />
  </Icon>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icon>
);

export const SpeakerIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Icon>
);
