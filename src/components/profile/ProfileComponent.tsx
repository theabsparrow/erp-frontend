import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { apiPatchFormData } from "@/lib/api";
import type { ProfileResponse } from "@/types/profile.type";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ErrorState } from "./ErrorState";
import { getInitials } from "@/utills/getInitial";
import { formatDate } from "@/utills/formatDate";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/provider/AuthProvider";
import { toast } from "sonner";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Shield,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import InRow from "./InRow";

// ── Schemas ───────────────────────────────────────────────────────────────────
const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
});
type UpdateForm = z.infer<typeof updateSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";

// ── Main ──────────────────────────────────────────────────────────────────────
const ProfileComponent = () => {
  const { user: authUser } = useAuth();
  const perms = authUser?.permissions ?? [];
  const canChangePassword = perms.includes(PERMISSIONS.AUTH_CHANGE_PASSWORD);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useGet<ProfileResponse>(
    ["profile"],
    "/users/me"
  );

  // ── Profile picture state ──
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Update profile form ──
  const {
    register: regUpdate,
    handleSubmit: handleUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    values: {
      name: data?.data?.name ?? "",
      phone: (data?.data as { phone?: string })?.phone ?? "",
    },
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation<
    unknown,
    unknown,
    FormData
  >({
    mutationFn: (fd) => apiPatchFormData("/users/me", undefined, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to update profile")
        : "Something went wrong";
      toast.error(msg);
    },
  });

  function onUpdateSubmit(values: UpdateForm) {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("phone", values.phone);
    if (selectedFile) fd.append("profilePicture", selectedFile);
    updateProfile(fd);
  }

  // ── Change password form ──
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: changePassword, isPending: isChangingPwd } = useMutate<
    unknown,
    PasswordForm
  >("PATCH", "/auth/change-password", {
    onSuccess: () => {
      toast.success("Password changed successfully");
      resetPwd();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to change password")
        : "Something went wrong";
      toast.error(msg);
    },
  });

  function onPasswordSubmit(values: PasswordForm) {
    changePassword({ body: values });
  }

  // ── File handlers ──
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearFile() {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Loading / error ──
  if (isLoading) return <ProfileSkeleton />;
  if (isError) {
    const msg = error instanceof Error ? error.message : "Something went wrong.";
    return <ErrorState message={msg} />;
  }

  const user = data?.data;
  if (!user) return <ErrorState message="No profile data returned." />;

  const avatarSrc =
    previewUrl ?? (user as { profilePicture?: string }).profilePicture ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* ── Hero card ── */}
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/40 flex items-center justify-center shrink-0 overflow-hidden">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-violet-300">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {user.name}
            </h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
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

      {/* ── Update Profile ── */}
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Pencil size={13} className="text-violet-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Update Profile</h2>
        </div>

        <form onSubmit={handleUpdate(onUpdateSubmit)} className="p-5 space-y-4">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base font-bold text-violet-300">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              {selectedFile && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-pic-input"
              />
              <label
                htmlFor="profile-pic-input"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors"
              >
                <Upload size={12} />
                {selectedFile ? "Change photo" : "Upload photo"}
              </label>
              <p className="text-xs text-slate-600 mt-1">
                JPG, PNG, WEBP up to 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" error={updateErrors.name?.message}>
              <input
                {...regUpdate("name")}
                placeholder="Your name"
                className={inputCls}
              />
            </Field>
            <Field label="Phone" error={updateErrors.phone?.message}>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  {...regUpdate("phone")}
                  placeholder="+1 234 567 890"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              {isUpdating ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change Password ── */}
      {canChangePassword && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
              <KeyRound size={13} className="text-amber-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Change Password
            </h2>
          </div>

          <form
            onSubmit={handlePwd(onPasswordSubmit)}
            className="p-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Current Password"
                error={pwdErrors.oldPassword?.message}
              >
                <input
                  {...regPwd("oldPassword")}
                  type="password"
                  placeholder="••••••••"
                  className={inputCls}
                />
              </Field>
              <Field
                label="New Password"
                error={pwdErrors.newPassword?.message}
              >
                <input
                  {...regPwd("newPassword")}
                  type="password"
                  placeholder="••••••••"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isChangingPwd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {isChangingPwd && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {isChangingPwd ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;
