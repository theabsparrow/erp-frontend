import { useGet } from "@/hooks/useGet";
import type { ProfileResponse } from "@/types/profile.type";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPermission(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-md bg-white/5">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-white font-medium">Failed to load profile</p>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { data, isLoading, isError, error } = useGet<ProfileResponse>(
    ["profile"],
    "/users/me"
  );

  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    const msg =
      error instanceof Error ? error.message : "Something went wrong.";
    return <ErrorState message={msg} />;
  }

  const user = data?.data;
  if (!user) return <ErrorState message="No profile data returned." />;

  const permissions = user.role?.permissions ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* ── Hero card ── */}
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/40 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-violet-300">
              {getInitials(user.name)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {user.name}
            </h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
              user.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {user.isActive ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {user.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account info */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Account
          </p>
          <InfoRow icon={User} label="Full Name" value={user.name} />
          <InfoRow icon={Mail} label="Email Address" value={user.email} />
          <InfoRow
            icon={Shield}
            label="Role"
            value={
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-medium capitalize">
                {user.role?.name ?? "—"}
              </span>
            }
          />
        </div>

        {/* Timestamps */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Activity
          </p>
          <InfoRow
            icon={Clock}
            label="Member Since"
            value={formatDate(user.createdAt)}
          />
          <InfoRow
            icon={Clock}
            label="Last Updated"
            value={formatDate(user.updatedAt)}
          />
          <InfoRow
            icon={Key}
            label="Total Permissions"
            value={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-xs font-medium border border-white/10">
                {permissions.length} assigned
              </span>
            }
          />
        </div>
      </div>

      {/* ── Permissions ── */}
      {permissions.length > 0 && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Permissions
          </p>
          <div className="flex flex-wrap gap-2">
            {permissions.map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/8 hover:border-violet-500/30 hover:text-violet-300 transition-colors"
              >
                {formatPermission(p)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
