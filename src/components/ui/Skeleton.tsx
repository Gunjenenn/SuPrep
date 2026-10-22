import { cn } from '@/lib/cn';

/** Loading placeholder. Use in loading.tsx files. */
export function Skeleton({
  className,
  rounded = 'xl',
}: {
  className?: string;
  rounded?: 'md' | 'xl' | 'full';
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton bg-paper-2',
        { md: 'rounded-md', xl: 'rounded-2xl', full: 'rounded-full' }[rounded],
        className,
      )}
    />
  );
}
