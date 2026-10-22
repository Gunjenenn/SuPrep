import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
}
