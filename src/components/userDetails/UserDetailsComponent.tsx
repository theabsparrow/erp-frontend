import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGet } from "@/hooks/useGet";
import { apiPatchFormData } from "@/lib/api";
import type { TUserResponse } from "@/types/user.type";
import type { TRolesResponse, TRole } from "@/types/role.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utills/formatDate";
import { useAuth } from "@/provider/AuthProvider";
import { PERMISSIONS } from "@/constants/permissions";
import { toast } from "sonner";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Hash,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "block"]),
});
type FormValues = z.infer<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";

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
        <div className="text-sm text-white mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailsSkeleton() {
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function UserDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();
  const perms = authUser?.permissions ?? [];
  const canUpdate = perms.includes(PERMISSIONS.UPDATE_USER);

  // ── Fetch user ──
  const { data, isLoading, isError } = useGet<TUserResponse>(
    ["user", id],
    `/users/${id}`,
    { enabled: !!id }
  );

  // ── Fetch roles ──
  const { data: rolesData } = useGet<TRolesResponse>(["roles"], "/roles");
  const roles: TRole[] = rolesData?.data?.roles ?? [];

  // ── Photo state ──
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form ──
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const user = data?.data;

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?._id ?? "",
        status: user.status,
      });
      setPreviewUrl(user.profilePicture ?? null);
      setSelectedFile(null);
    }
  }, [user, reset]);

  // ── Mutation ──
  const { mutate, isPending } = useMutation<TUserResponse, unknown, FormData>({
    mutationFn: (fd) => apiPatchFormData<TUserResponse>("/users", id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to update user")
        : "Something went wrong";
      toast.error(msg);
    },
  });

  function onSubmit(values: FormValues) {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("email", values.email);
    fd.append("phone", values.phone);
    fd.append("role", values.role);
    fd.append("status", values.status);
    if (selectedFile) fd.append("profilePicture", selectedFile);
    mutate(fd);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearFile() {
    setSelectedFile(null);
    setPreviewUrl(user?.profilePicture ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── States ──
  if (isLoading) return <DetailsSkeleton />;

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

  const avatarSrc = previewUrl ?? user.profilePicture ?? null;

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

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero card */}
        <div className="lg:col-span-1 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-fit">
          <div className="w-24 h-24 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center overflow-hidden shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-violet-300">
                {getInitials(user.name)}
              </span>
            )}
          </div>
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
            <InfoRow icon={User} label="Full Name" value={user.name} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phone || "—"} />
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
        </div>
      </div>

      {/* Update form */}
      {canUpdate && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Pencil size={13} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Update User</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
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
                  id="user-pic-input"
                />
                <label
                  htmlFor="user-pic-input"
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

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  placeholder="Full name"
                  className={inputCls}
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="email@example.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            </div>

            {/* Phone + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" error={errors.phone?.message}>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    {...register("phone")}
                    placeholder="+1 234 567 890"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Role" error={errors.role?.message}>
                <div className="relative">
                  <Shield
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <select
                    {...register("role")}
                    className={`${inputCls} pl-9 appearance-none`}
                  >
                    <option value="" className="bg-[#0f0f13]">
                      Select a role
                    </option>
                    {roles.map((r) => (
                      <option
                        key={r._id}
                        value={r._id}
                        className="bg-[#0f0f13] capitalize"
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>

            {/* Status */}
            <Field label="Status" error={errors.status?.message}>
              <div className="flex gap-4 pt-1">
                {(["active", "block"] as const).map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      {...register("status")}
                      type="radio"
                      value={s}
                      className="accent-violet-500"
                    />
                    <span
                      className={`text-sm capitalize ${
                        s === "active" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {s === "active" ? "Active" : "Blocked"}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
