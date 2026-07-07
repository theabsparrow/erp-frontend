import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Calendar,
  AlertCircle,
  Activity,
  Hash,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import type { TUserResponse } from "@/types/user.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utills/formatDate";

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
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm text-white mt-0.5 wrap-break-word">{value}</div>
      </div>
    </div>
  );
}

export function UserDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGet<TUserResponse>(
    ["user", id],
    `/users/${id}`,
    { enabled: !!id },
  );

  const user = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-white/5 rounded-xl" />
        <Skeleton className="h-40 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-white font-medium">User not found</p>
          <p className="text-slate-400 text-sm">
            This user may have been deleted or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white">User Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero card */}
        <div className="lg:col-span-1 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-fit">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-violet-300">
                {initials}
              </span>
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-white">{user.name}</p>
            <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                user.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {user.status === "active" ? "Active" : "Blocked"}
            </span>
            {user.role && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                {user.role.name}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl px-5 py-2">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phone} />
            <InfoRow
              icon={Shield}
              label="Role"
              value={
                user.role ? (
                  <span className="capitalize px-2 py-0.5 rounded-md text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {user.role.name}
                  </span>
                ) : (
                  <span className="text-slate-500">No role assigned</span>
                )
              }
            />
            <InfoRow
              icon={Activity}
              label="Status"
              value={
                <span
                  className={
                    user.status === "active"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {user.status === "active" ? "Active" : "Blocked"}
                </span>
              }
            />
            {user.createdAt && (
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={formatDate(user.createdAt)}
              />
            )}
            {user.updatedAt && (
              <InfoRow
                icon={Hash}
                label="Last Updated"
                value={formatDate(user.updatedAt)}
              />
            )}
          </div>

          {/* Meta card */}
          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Account Info
            </h3>
            <div className="space-y-2.5">
             
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Role</span>
                <span className="text-white capitalize">
                  {user.role?.name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/8 pt-2.5">
                <span className="text-slate-500">Account Status</span>
                <span
                  className={`text-xs font-medium ${user.status === "active" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {user.status === "active" ? "Active" : "Blocked"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
