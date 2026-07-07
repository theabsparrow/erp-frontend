import { useGet } from "@/hooks/useGet";
import type { ProfileResponse } from "@/types/profile.type";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ErrorState } from "./ErrorState";
import { getInitials } from "@/utills/getInitial";
import {
  CheckCircle2,
  Clock,
  Mail,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import InRow from "./InRow";
import { formatDate } from "@/utills/formatDate";

const ProfileComponent = () => {
  const { data, isLoading, isError, error } = useGet<ProfileResponse>(
    ["profile"],
    "/users/me",
  );

  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    const msg =
      error instanceof Error ? error.message : "Something went wrong.";
    return <ErrorState message={msg} />;
  }

  const user = data?.data;
  if (!user) return <ErrorState message="No profile data returned." />;

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
            {user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
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
          <InRow icon={User} label="Full Name" value={user.name} />
          <InRow icon={Mail} label="Email Address" value={user.email} />
          <InRow
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
          <InRow
            icon={Clock}
            label="Member Since"
            value={formatDate(user.createdAt)}
          />
          <InRow
            icon={Clock}
            label="Last Updated"
            value={formatDate(user.updatedAt)}
          />
          
        </div>
      </div>
      
    </div>
  );
};

export default ProfileComponent;
