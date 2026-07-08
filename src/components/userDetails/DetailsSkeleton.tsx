import { Skeleton } from "../ui/skeleton";

export function DetailsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="h-56 bg-white/5 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 bg-white/5 rounded-2xl" />
          <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-64 bg-white/5 rounded-2xl" />
    </div>
  );
}