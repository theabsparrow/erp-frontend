import { Loader2, Trash2 } from "lucide-react";
import type { TUser } from "@/types/user.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  user: TUser | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteUserModal({ open, user, isPending, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-sm gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-0 gap-0">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-base">Delete User</DialogTitle>
              <p className="text-sm text-slate-400 mt-1.5">
                Are you sure you want to delete{" "}
                <span className="text-white font-medium">"{user?.name}"</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
