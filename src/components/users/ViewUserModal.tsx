import { formatDate } from "@/utills/formatDate";
import type { TUser } from "@/types/user.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Shield, Calendar, Activity } from "lucide-react";

interface Props {
  open: boolean;
  user: TUser | null;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function ViewUserModal({ open, user, onClose }: Props) {
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-md gap-0"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <User size={13} className="text-sky-400" />
            </div>
            <DialogTitle className="text-white text-base">User Details</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Avatar + name hero */}
          <div className="flex items-center gap-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-violet-300">{initials}</span>
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-white">{user.name}</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${
                  user.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="bg-white/2 rounded-xl border border-white/8 px-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phone} />
            <InfoRow
              icon={Shield}
              label="Role"
              value={
                user.role ? (
                  <span className="px-2 py-0.5 rounded-md text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                    {user.role.name}
                  </span>
                ) : (
                  <span className="text-slate-500">No role assigned</span>
                )
              }
            />
            <InfoRow
              icon={Activity}
              label="Account Status"
              value={
                <span className={user.status === "active" ? "text-emerald-400" : "text-red-400"}>
                  {user.status === "active" ? "Active" : "Blocked"}
                </span>
              }
            />
            {user.createdAt && (
              <InfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
            )}
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
