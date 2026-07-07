import { useState } from "react";
import { Plus, AlertCircle, Search, X, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { UpdateCategoryModal } from "./UpdateCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import type { TCategory, TCategoriesResponse, TCategoryResponse } from "@/types/category.type";
import { formatDate } from "@/utills/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
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

const LIMIT = 12;

export function CategoriesComponent() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];

  const canCreate = perms.includes(PERMISSIONS.CREATE_CATEGORY);
  const canUpdate = perms.includes(PERMISSIONS.UPDATE_CATEGORY);
  const canDelete = perms.includes(PERMISSIONS.DELETE_CATEGORY);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<TCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<TCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryParams: Record<string, unknown> = { page, limit: LIMIT };
  if (search) queryParams.searchTerm = search;

  const { data, isLoading, isError, error } = useGet<TCategoriesResponse>(
    ["categories"],
    "/categories",
    { params: queryParams }
  );

  const { mutate: deleteCategory_, isPending: isDeleting } = useMutate<TCategoryResponse>(
    "DELETE",
    "/categories",
    {
      invalidateKeys: [["categories"]],
      onSuccess: () => {
        toast.success("Category deleted successfully");
        setDeleteCategory(null);
        setDeletingId(null);
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to delete category")
          : "Something went wrong";
        toast.error(msg);
        setDeletingId(null);
      },
    }
  );

  function handleDeleteConfirm() {
    if (!deleteCategory) return;
    setDeletingId(deleteCategory._id);
    deleteCategory_({ id: deleteCategory._id });
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
  const categories: TCategory[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;
  const total = meta?.total ?? 0;

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
          <h1 className="text-xl font-semibold text-white">Categories</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage product categories</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            Create Category
          </button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && !isError && meta && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Categories</p>
            <p className="text-2xl font-semibold text-white mt-0.5">{total}</p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">This Page</p>
            <p className="text-2xl font-semibold text-violet-400 mt-0.5">{categories.length}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories…"
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

      {/* Error */}
      {isError && (
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Failed to load categories</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FolderOpen size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm font-medium">No categories found</p>
          <p className="text-slate-600 text-xs mt-1">
            {search ? "Try a different search term" : "Create your first category to get started"}
          </p>
        </div>
      )}

      {/* Card grid */}
      {!isLoading && !isError && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const isBeingDeleted = deletingId === cat._id;
            const initial = cat.name[0]?.toUpperCase() ?? "C";
            return (
              <div
                key={cat._id}
                className="group relative bg-[#0f0f13] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-all"
              >
                {/* Icon + name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-violet-300">{initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white capitalize truncate">{cat.name}</p>
                    {cat.createdAt && (
                      <p className="text-xs text-slate-600 mt-0.5">{formatDate(cat.createdAt)}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                  {cat.description}
                </p>

                {/* Actions */}
                {(canUpdate || canDelete) && (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    {canUpdate && (
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteCategory(cat)}
                        disabled={isBeingDeleted}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                      >
                        {isBeingDeleted
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} />
                        }
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPage > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPage} · {total} categories
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

      {/* Modals */}
      <CreateCategoryModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpdateCategoryModal
        open={!!editCategory}
        category={editCategory}
        onClose={() => setEditCategory(null)}
      />
      <DeleteCategoryModal
        open={!!deleteCategory}
        category={deleteCategory}
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteCategory(null)}
      />
    </div>
  );
}
