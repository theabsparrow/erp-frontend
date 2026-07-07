import { AlertCircle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-white font-medium">Failed to load profile</p>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}