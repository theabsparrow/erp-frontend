import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl bg-white/5" />
        <Skeleton className="h-64 rounded-2xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-56 rounded-2xl bg-white/5" />
        <Skeleton className="h-56 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}