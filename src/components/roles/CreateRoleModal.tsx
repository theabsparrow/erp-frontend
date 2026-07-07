import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Check } from "lucide-react";
import { useMutate } from "@/hooks/useMutate";
import type { TRoleResponse, TCreateRolePayload } from "@/types/role.type";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TPermissions } from "@/types/types.permission";
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  allPermissions: TPermissions[];
  onClose: () => void;
}

export function CreateRoleModal({ open, allPermissions, onClose }: Props) {
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { mutate, isPending } = useMutate<TRoleResponse, TCreateRolePayload>(
    "POST",
    "/roles",
    {
      invalidateKeys: [["roles"]],
      onSuccess: () => {
        toast.success("Role created successfully");
        handleClose();
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to create role")
          : "Something went wrong";
        toast.error(msg);
      },
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function handleClose() {
    reset();
    setSelectedPerms([]);
    onClose();
  }

  function togglePerm(p: string) {
    setSelectedPerms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function toggleAll() {
    setSelectedPerms((prev) =>
      prev.length === allPermissions.length
        ? []
        : allPermissions.map((p) => p.key),
    );
  }

  function onSubmit(values: FormValues) {
    const data: TCreateRolePayload = {
      ...values,
      ...(selectedPerms.length > 0 && { permissions: selectedPerms }),
    };
    mutate({
      body: data,
    });
  }

  const allSelected = selectedPerms.length === allPermissions.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-lg max-h-[90vh] flex flex-col gap-0"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Plus size={14} className="text-violet-400" />
            </div>
            <DialogTitle className="text-white text-base">
              Create Role
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form
            id="create-role-form"
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-5"
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="e.g. Manager"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={2}
                placeholder="Describe this role…"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Permissions
                  {selectedPerms.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs font-semibold">
                      {selectedPerms.length} selected
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {allPermissions.map((p) => {
                  const checked = selectedPerms.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePerm(p.key)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm text-left transition-all",
                        checked
                          ? "bg-violet-500/10 border-violet-500/30 text-white"
                          : "bg-white/3 border-white/8 text-slate-400 hover:bg-white/6 hover:text-slate-200 hover:border-white/15",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          checked
                            ? "bg-violet-600 border-violet-600"
                            : "border-white/20",
                        )}
                      >
                        {checked && <Check size={10} className="text-white" />}
                      </div>
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
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
            form="create-role-form"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Creating…" : "Create Role"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
