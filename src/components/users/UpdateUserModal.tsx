/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatchFormData } from "@/lib/api";
import type { TUser, TUserResponse } from "@/types/user.type";
import type { TRole } from "@/types/role.type";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "block"]),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  user: TUser | null;
  roles: TRole[];
  onClose: () => void;
}

export function UpdateUserModal({ open, user, roles, onClose }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<TUserResponse, unknown, FormData>({
    mutationFn: (formData) => apiPatchFormData<TUserResponse>("/users", user?._id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      handleClose();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to update user")
        : "Something went wrong";
      toast.error(msg);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?._id ?? "",
        status: user.status,
      });
      setPreviewUrl(user?.profilePicture ?? null);
      setSelectedFile(null);
    }
  }, [user, reset]);

  function handleClose() {
    reset();
    setPreviewUrl(null);
    setSelectedFile(null);
    onClose();
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

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-lg max-h-[90vh] flex flex-col gap-0"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Pencil size={13} className="text-amber-400" />
            </div>
            <DialogTitle className="text-white text-base">Update User</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <form id="update-user-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Profile picture */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-300">{initials}</span>
                  </div>
                )}
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
                  id="profile-picture-input"
                />
                <label
                  htmlFor="profile-picture-input"
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors"
                  )}
                >
                  <Upload size={12} />
                  {selectedFile ? "Change photo" : "Upload photo"}
                </label>
                <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP up to 5MB</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                {...register("phone")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                {...register("role")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none"
              >
                <option value="" className="bg-[#0f0f13]">Select a role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id} className="bg-[#0f0f13] capitalize">
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <div className="flex gap-4">
                {(["active", "block"] as const).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input {...register("status")} type="radio" value={s} className="accent-violet-500" />
                    <span className={`text-sm capitalize ${s === "active" ? "text-emerald-400" : "text-red-400"}`}>
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="update-user-form"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
