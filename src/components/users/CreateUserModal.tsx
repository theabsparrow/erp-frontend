import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, Eye, EyeOff, Check, X } from "lucide-react";
import { useMutate } from "@/hooks/useMutate";
import type { TUserResponse, TCreateUserPayload } from "@/types/user.type";
import type { TRole } from "@/types/role.type";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const passwordRules = [
  { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  password: z
    .string()
    .min(6, "At least 6 characters")
    .regex(/[A-Z]/, "One uppercase letter required")
    .regex(/[a-z]/, "One lowercase letter required")
    .regex(/[0-9]/, "One number required")
    .regex(/[^A-Za-z0-9]/, "One special character required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "block"]).optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  roles: TRole[];
  onClose: () => void;
}

export function CreateUserModal({ open, roles, onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutate<TUserResponse, TCreateUserPayload>(
    "POST",
    "/users",
    {
      invalidateKeys: [["users"]],
      onSuccess: () => {
        toast.success("User created successfully");
        handleClose();
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to create user")
          : "Something went wrong";
        toast.error(msg);
      },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  const passwordValue = watch("password") ?? "";

  function handleClose() {
    reset();
    setShowPassword(false);
    onClose();
  }

  function onSubmit(values: FormValues) {
    mutate({ body: values as TCreateUserPayload });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-lg max-h-[90vh] flex flex-col gap-0"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <UserPlus size={13} className="text-violet-400" />
            </div>
            <DialogTitle className="text-white text-base">Create User</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <form id="create-user-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Full name"
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
                placeholder="email@example.com"
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
                placeholder="+1 234 567 8900"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password rules */}
              {passwordValue.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(passwordValue);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        {passed
                          ? <Check size={11} className="text-emerald-400 shrink-0" />
                          : <X size={11} className="text-slate-600 shrink-0" />}
                        <span className={`text-xs ${passed ? "text-emerald-400" : "text-slate-500"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.password && passwordValue.length === 0 && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
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
            form="create-user-form"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Creating…" : "Create User"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
