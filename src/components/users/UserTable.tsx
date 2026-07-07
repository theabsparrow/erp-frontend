import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/utills/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
import type { TUser } from "@/types/user.type";
import { Link } from "react-router-dom";

const col = createColumnHelper<TUser>();

interface Props {
  data: TUser[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (user: TUser) => void;
  onDelete: (user: TUser) => void;
}

export function UserTable({
  data,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  const columns = [
    col.display({
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            {u.profilePicture ? (
              <img
                src={u.profilePicture}
                alt={u.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-violet-300">
                  {initials}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {u.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("phone", {
      header: "Phone",
      cell: (info) => (
        <span className="text-slate-400 text-sm">{info.getValue()}</span>
      ),
    }),
    col.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue();
        return role ? (
          <span className="px-2 py-0.5 rounded-md text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
            {role.name}
          </span>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        );
      },
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
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {s}
          </span>
        );
      },
    }),
    col.accessor("createdAt", {
      header: "Joined",
      cell: (info) => {
        const v = info.getValue();
        return (
          <span className="text-slate-400 text-xs whitespace-nowrap">
            {v ? formatDate(v) : "—"}
          </span>
        );
      },
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        const isDeleting = deletingId === user._id;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Link
              to={`/users/${user?._id}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
              title="View Details"
            >
              <Eye size={14} />
            </Link>
            <button
              onClick={() => onEdit(user)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(user)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-slate-400 text-sm">No users found</p>
        <p className="text-slate-600 text-xs mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b border-white/10 bg-white/2"
            >
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/2"}`}
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
