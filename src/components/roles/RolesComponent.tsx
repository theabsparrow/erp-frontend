import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { RoleTable } from "./RoleTable";
import { CreateRoleModal } from "./CreateRoleModal";
import { UpdateRoleModal } from "./UpdateRoleModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import type { TRole, TRolesResponse } from "@/types/role.type";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/provider/AuthProvider";
import { PERMISSIONS } from "@/constants/permissions";
import type { TPermissions } from "@/types/types.permission";

export function RolesComponent() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];

  const canCreate = perms.includes(PERMISSIONS.CREATE_ROLE);
  const canUpdate = perms.includes(PERMISSIONS.UPDATE_ROLE);
  const canDelete = perms.includes(PERMISSIONS.DELETE_ROLE);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<TRole | null>(null);
  const [deleteRole, setDeleteRole] = useState<TRole | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useGet<TRolesResponse>(
    ["roles"],
    "/roles",
  );

  const { mutate: deleteRole_, isPending: isDeleting } = useMutate(
    "DELETE",
    "/roles",
    {
      invalidateKeys: [["roles"]],
      onSuccess: () => {
        toast.success("Role deleted successfully");
        setDeleteRole(null);
        setDeletingId(null);
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to delete role")
          : "Something went wrong";
        toast.error(msg);
        setDeletingId(null);
      },
    },
  );

  function handleDeleteConfirm() {
    if (!deleteRole) return;
    setDeletingId(deleteRole._id);
    deleteRole_({ id: deleteRole._id });
  }

  const roles: TRole[] = data?.data?.roles ?? [];
  const allPermissions: TPermissions[] = data?.data?.permissions ?? [];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Roles</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage roles and their permissions
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            Create Role
          </button>
        )}
      </div>
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Roles</p>
            <p className="text-2xl font-semibold text-white mt-0.5">
              {roles.length}
            </p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Active</p>
            <p className="text-2xl font-semibold text-emerald-400 mt-0.5">
              {roles.filter((r) => r.status === "active").length}
            </p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500">Frozen</p>
            <p className="text-2xl font-semibold text-amber-400 mt-0.5">
              {roles.filter((r) => r.status === "freeze").length}
            </p>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">
              Failed to load roles
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {!isError && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <RoleTable
            data={roles}
            isLoading={isLoading}
            deletingId={deletingId}
            onEdit={canUpdate ? (role) => setEditRole(role) : () => {}}
            onDelete={canDelete ? (role) => setDeleteRole(role) : () => {}}
          />
        </div>
      )}

      <CreateRoleModal
        open={createOpen}
        allPermissions={allPermissions}
        onClose={() => setCreateOpen(false)}
      />
      <UpdateRoleModal
        open={!!editRole}
        role={editRole}
        allPermissions={allPermissions}
        onClose={() => setEditRole(null)}
      />
      <DeleteConfirmModal
        open={!!deleteRole}
        role={deleteRole}
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteRole(null)}
      />
    </div>
  );
}
