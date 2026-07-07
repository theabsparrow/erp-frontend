import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, FolderPlus } from "lucide-react";
import { useMutate } from "@/hooks/useMutate";
import type { TCategoryResponse, TCreateCategoryPayload } from "@/types/category.type";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({ open, onClose }: Props) {
  const { mutate, isPending } = useMutate<TCategoryResponse, TCreateCategoryPayload>(
    "POST",
    "/categories",
    {
      invalidateKeys: [["categories"]],
      onSuccess: () => {
        toast.success("Category created successfully");
        handleClose();
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to create category")
          : "Something went wrong";
        toast.error(msg);
      },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: FormValues) {
    mutate({ body: values });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-md gap-0"
      >
        <DialogHeader className="flex-row items-center px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <FolderPlus size={13} className="text-violet-400" />
            </div>
            <DialogTitle className="text-white text-base">Create Category</DialogTitle>
          </div>
        </DialogHeader>

        <form id="create-category-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Electronics"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe this category…"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-category-form"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
