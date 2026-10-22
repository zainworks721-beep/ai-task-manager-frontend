import { cn } from '../../lib/cn';

export function Skeleton({ className, rounded = 'rounded-lg' }) {
  return <div aria-hidden="true" className={cn('skeleton', rounded, className)} />;
}

/** Matches the real TaskCard footprint so nothing jumps on load. */
export function TaskCardSkeleton({ delay = 0 }) {
  return (
    <div
      className="rounded-2xl border border-line bg-surface p-4 shadow-xs"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-4/5" />
      <Skeleton className="mb-1.5 h-3 w-full" />
      <Skeleton className="mb-4 h-3 w-2/3" />
      <div className="flex items-center justify-between border-t border-line-soft pt-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/** Full 3-column board placeholder. */
export function BoardSkeleton({ columns = 3, cards = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5" aria-hidden="true">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="rounded-2xl border border-line bg-surface/60 p-4 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-[10px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-2.5 border-t border-line-soft pt-3.5">
            {Array.from({ length: cards }).map((__, cardIndex) => (
              <TaskCardSkeleton key={cardIndex} delay={(colIndex * cards + cardIndex) * 60} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
