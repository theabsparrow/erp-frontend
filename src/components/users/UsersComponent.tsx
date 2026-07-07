import { useState } from "react";
import { Plus, AlertCircle, Search, X } from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { UserTable } from "./UserTable";
import { ViewUserModal } from "./ViewUserModal";
import { CreateUserModal } from "./CreateUserModal";
import { UpdateUserModal } from "./UpdateUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import type { TUser, TUsersResponse, TUserResponse } from "@/types/user.type";
import type { TRolesResponse } from "@/types/role.type";
import type { TRole } from "@/types/role.type";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/provider/AuthProvider";
import { PERMISSIONS } from "@/constants/permissions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const LIMIT = 10;

export function UsersComponent() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];

  const canCreate = perms.includes(PERMISSIONS.CREATE_USER);
  const canUpdate = perms.includes(PERMISSIONS.UPDATE_USER);
  const canDelete = perms.includes(PERMISSIONS.DELETE_USER);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "block">("");

  const [viewUser, setViewUser] = useState<TUser | null>(null);
  const [editUser, setEditUser] = useState<TUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<TUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const queryParams: Record<string, unknown> = { page, limit: LIMIT };
  if (search) queryParams.searchTerm = search;
  if (statusFilter) queryParams.status = statusFilter;

  const { data, isLoading, isError, error } = useGet<TUsersResponse>(
    ["users"],
    "/users",
    { params: queryParams }
  );

  // Fetch roles for dropdowns (only roles, no permissions needed)
  const { data: rolesData } = useGet<TRolesResponse>(["roles"], "/roles");


  const { mutate: deleteUser_, isPending: isDeleting } = useMutate<TUserResponse>(
    "DELETE",
    "/users",
    {
      invalidateKeys: [["users"]],
      onSuccess: () => {
        toast.success("User deleted successfully");
        setDeleteUser(null);
        setDeletingId(null);
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to delete user")
          : "Something went wrong";
        toast.error(msg);
        setDeletingId(null);
      },
    }
  );

  function handleDeleteConfirm() {
    if (!deleteUser) return;
    setDeletingId(deleteUser._id);
    deleteUser_({ id: deleteUser._id });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function handleStatusFilter(val: "" | "active" | "block") {
    setStatusFilter(val);
    setPage(1);
  }

  const users: TUser[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;
  const total = meta?.total ?? 0;
  const roles: TRole[] = rolesData?.data?.roles ?? [];

  // Build page numbers with ellipsis
  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPage <= 7) return Array.from({ length: totalPage }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPage - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPage - 2) pages.push("ellipsis");
    pages.push(totalPage);
    return pages;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage system users</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            Create User
          </button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && !isError && meta && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Users</p>
            <p className="text-2xl font-semibold text-white mt-0.5">{total}</p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Active</p>
            <p className="text-2xl font-semibold text-emerald-400 mt-0.5">
              {users.filter((u) => u.status === "active").length}
            </p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500">Blocked</p>
            <p className="text-2xl font-semibold text-red-400 mt-0.5">
              {users.filter((u) => u.status === "block").length}
            </p>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0f0f13] border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Status filter */}
        <div className="flex gap-2 shrink-0">
          {(["", "active", "block"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-[#0f0f13] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {s === "" ? "All" : s === "active" ? "Active" : "Blocked"}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Failed to load users</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isError && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <UserTable
            data={users}
            isLoading={isLoading}
            deletingId={deletingId}
            onEdit={canUpdate ? (u) => setEditUser(u) : () => {}}
            onDelete={canDelete ? (u) => setDeleteUser(u) : () => {}}
          />

          {/* Pagination */}
          {!isLoading && totalPage > 1 && (
            <div className="px-4 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPage} · {total} users
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                      className={page === 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => { e.preventDefault(); setPage(p); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (page < totalPage) setPage(page + 1); }}
                      className={page === totalPage ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ViewUserModal
        open={!!viewUser}
        user={viewUser}
        onClose={() => setViewUser(null)}
      />
      <CreateUserModal
        open={createOpen}
        roles={roles}
        onClose={() => setCreateOpen(false)}
      />
      <UpdateUserModal
        open={!!editUser}
        user={editUser}
        roles={roles}
        onClose={() => setEditUser(null)}
      />
      <DeleteUserModal
        open={!!deleteUser}
        user={deleteUser}
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}
