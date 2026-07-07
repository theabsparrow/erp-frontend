import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { formatPermission } from "@/utills/joinPermission";
import { formatDate } from "@/utills/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
import type { TRole } from "@/types/role.type";

const col = createColumnHelper<TRole>();

interface Props {
  data: TRole[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (role: TRole) => void;
  onDelete: (role: TRole) => void;
}

export function RoleTable({ data, isLoading, deletingId, onEdit, onDelete }: Props) {
  const columns = [
    col.accessor("name", {
      header: "Name",
      cell: (info) => (
        <span className="font-medium text-white capitalize">{info.getValue()}</span>
      ),
    }),
    col.accessor("description", {
      header: "Description",
      cell: (info) => (
        <span className="text-slate-400 line-clamp-2 max-w-xs">{info.getValue()}</span>
      ),
    }),
    col.accessor("status", {
      header: "Status",
      cell: (info) => {
        const s = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              s === "active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {s}
          </span>
        );
      },
    }),
    col.accessor("permissions", {
      header: "Permissions",
      cell: (info) => {
        const perms = info.getValue();
        if (!perms.length) return <span className="text-slate-600 text-xs">None</span>;
        const visible = perms.slice(0, 2);
        const rest = perms.length - 2;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map((p) => (
              <span key={p} className="px-1.5 py-0.5 rounded text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {formatPermission(p)}
              </span>
            ))}
            {rest > 0 && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-slate-400 border border-white/10">
                +{rest} more
              </span>
            )}
          </div>
        );
      },
    }),
    col.accessor("createdAt", {
      header: "Created",
      cell: (info) => {
        const v = info.getValue();
        return <span className="text-slate-400 text-xs whitespace-nowrap">{v ? formatDate(v) : "—"}</span>;
      },
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const role = row.original;
        const isDeleting = deletingId === role._id;
        return (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => onEdit(role)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(role)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <span className="text-2xl">🛡️</span>
        </div>
        <p className="text-slate-400 text-sm">No roles found</p>
        <p className="text-slate-600 text-xs mt-1">Create your first role to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-white/10 bg-white/3">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
