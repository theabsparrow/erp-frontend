import { Skeleton } from "../ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full bg-white/8" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 bg-white/8" />
            <Skeleton className="h-3.5 w-24 bg-white/8" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6 space-y-3"
          >
            <Skeleton className="h-4 w-28 bg-white/8" />
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-10 w-full bg-white/8" />
            ))}
          </div>
        ))}
      </div>
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6 space-y-3">
        <Skeleton className="h-4 w-28 bg-white/8" />
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-28 rounded-full bg-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}