import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, X, Check, Plus } from "lucide-react";
import { useMutate } from "@/hooks/useMutate";
import { formatPermission } from "@/utills/joinPermission";
import type { TRole, TRoleResponse, TUpdateRolePayload } from "@/types/role.type";
import type { TPermissions } from "@/types/types.permission";
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
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "freeze"]),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  role: TRole | null;
  allPermissions: TPermissions[];
  onClose: () => void;
}

export function UpdateRoleModal({ open, role, allPermissions, onClose }: Props) {
  // permsToKeep = existing permissions the user wants to keep (starts as all existing)
  const [permsToKeep, setPermsToKeep] = useState<string[]>([]);
  // permsToAdd = pending permissions the user wants to add (starts empty)
  const [permsToAdd, setPermsToAdd] = useState<string[]>([]);

  const { mutate, isPending } = useMutate<TRoleResponse, TUpdateRolePayload>(
    "PATCH",
    "/roles",
    {
      invalidateKeys: [["roles"]],
      onSuccess: () => {
        toast.success("Role updated successfully");
        handleClose();
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to update role")
          : "Something went wrong";
        toast.error(msg);
      },
    }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (role) {
      reset({ name: role.name, description: role.description, status: role.status });
      setPermsToKeep([...role.permissions]);
      setPermsToAdd([]);
    }
  }, [role, reset]);

  function handleClose() {
    reset();
    setPermsToKeep([]);
    setPermsToAdd([]);
    onClose();
  }

  // Remove one from existing — moves it out of keep list
  function removeExisting(p: string) {
    setPermsToKeep((prev) => prev.filter((x) => x !== p));
  }

  // Toggle a pending permission to add
  function togglePending(p: string) {
    setPermsToAdd((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  // Select all pending
  function toggleAllPending() {
    setPermsToAdd((prev) =>
      prev.length === pendingPermissions.length
        ? []
        : pendingPermissions.map((p) => p.key)
    );
  }

  function onSubmit(values: FormValues) {
    if (!role) return;
    const payload: TUpdateRolePayload = { ...values };

    const removed = role.permissions.filter((p) => !permsToKeep.includes(p));
    if (permsToAdd.length) payload.addPermissions = permsToAdd;
    if (removed.length) payload.removePermissions = removed;

    mutate({ id: role._id, body: payload });
  }

  if (!role) return null;

  // Permissions not yet on this role
  const pendingPermissions = allPermissions.filter(
    (p) => !role.permissions.includes(p.key)
  );

  const allPendingSelected =
    pendingPermissions.length > 0 &&
    permsToAdd.length === pendingPermissions.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-xl max-h-[90vh] flex flex-col gap-0"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 gap-0 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Pencil size={13} className="text-amber-400" />
            </div>
            <DialogTitle className="text-white text-base">Update Role</DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form id="update-role-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <div className="flex gap-4">
                {(["active", "freeze"] as const).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input {...register("status")} type="radio" value={s} className="accent-violet-500" />
                    <span className={cn("text-sm capitalize", s === "active" ? "text-emerald-400" : "text-amber-400")}>
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Permissions panels ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Existing permissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Existing
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/8 text-slate-300 normal-case tracking-normal font-medium">
                      {permsToKeep.length}
                    </span>
                  </span>
                  {permsToKeep.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPermsToKeep([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove all
                    </button>
                  )}
                </div>

                <div className="min-h-32 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-white/2 p-2 space-y-1">
                  {permsToKeep.length === 0 ? (
                    <div className="flex items-center justify-center h-28 text-slate-600 text-xs">
                      No permissions assigned
                    </div>
                  ) : (
                    permsToKeep.map((p) => (
                      <div
                        key={p}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 group"
                      >
                        <span className="text-xs text-emerald-300 truncate">{formatPermission(p)}</span>
                        <button
                          type="button"
                          onClick={() => removeExisting(p)}
                          className="shrink-0 p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending permissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Pending
                    {permsToAdd.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 normal-case tracking-normal font-medium">
                        {permsToAdd.length} selected
                      </span>
                    )}
                  </span>
                  {pendingPermissions.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllPending}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {allPendingSelected ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>

                <div className="min-h-32 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-white/2 p-2 space-y-1">
                  {pendingPermissions.length === 0 ? (
                    <div className="flex items-center justify-center h-28 text-slate-600 text-xs">
                      All permissions assigned
                    </div>
                  ) : (
                    pendingPermissions.map((p) => {
                      const selected = permsToAdd.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => togglePending(p.key)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all",
                            selected
                              ? "bg-violet-500/10 border-violet-500/25 text-white"
                              : "bg-white/3 border-white/8 text-slate-400 hover:bg-white/6 hover:text-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            selected ? "bg-violet-600 border-violet-600" : "border-white/20"
                          )}>
                            {selected
                              ? <Check size={9} className="text-white" />
                              : <Plus size={9} className="text-slate-500" />
                            }
                          </div>
                          <span className="truncate">{p.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Summary of changes */}
            {(permsToAdd.length > 0 || role.permissions.filter(p => !permsToKeep.includes(p)).length > 0) && (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/3 border border-white/8 text-xs">
                {permsToAdd.length > 0 && (
                  <span className="text-emerald-400">
                    +{permsToAdd.length} to add
                  </span>
                )}
                {role.permissions.filter(p => !permsToKeep.includes(p)).length > 0 && (
                  <span className="text-red-400">
                    −{role.permissions.filter(p => !permsToKeep.includes(p)).length} to remove
                  </span>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
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
            form="update-role-form"
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
