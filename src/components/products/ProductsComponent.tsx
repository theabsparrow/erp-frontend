import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus, AlertCircle, Search, X, Eye, Pencil, Trash2, Loader2, Package,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { CreateProductModal } from "./CreateProductModal";
import { UpdateProductModal } from "./UpdateProductModal";
import { ViewProductModal } from "./ViewProductModal";
import { DeleteProductModal } from "./DeleteProductModal";
import type { TProduct, TProductsResponse, TProductResponse } from "@/types/product.type";
import type { TCategoriesResponse, TCategory } from "@/types/category.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utills/formatDate";
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
const col = createColumnHelper<TProduct>();

export function ProductsComponent() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];

  const canCreate = perms.includes(PERMISSIONS.CREATE_PRODUCT);
  const canUpdate = perms.includes(PERMISSIONS.UPDATE_PRODUCT);
  const canDelete = perms.includes(PERMISSIONS.DELETE_PRODUCT);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [viewProduct, setViewProduct] = useState<TProduct | null>(null);
  const [editProduct, setEditProduct] = useState<TProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<TProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const queryParams: Record<string, unknown> = { page, limit: LIMIT };
  if (search) queryParams.searchTerm = search;
  if (categoryFilter) queryParams.category = categoryFilter;

  const { data, isLoading, isError, error } = useGet<TProductsResponse>(
    ["products"],
    "/products",
    { params: queryParams }
  );

  // Fetch all categories for filter dropdown + modals (no pagination needed here)
  const { data: catData } = useGet<TCategoriesResponse>(
    ["categories-all"],
    "/categories",
    { params: { limit: 999 } }
  );

  const { mutate: deleteProduct_, isPending: isDeleting } = useMutate<TProductResponse>(
    "DELETE",
    "/products",
    {
      invalidateKeys: [["products"]],
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setDeleteProduct(null);
        setDeletingId(null);
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to delete product")
          : "Something went wrong";
        toast.error(msg);
        setDeletingId(null);
      },
    }
  );

  function handleDeleteConfirm() {
    if (!deleteProduct) return;
    setDeletingId(deleteProduct._id);
    deleteProduct_({ id: deleteProduct._id });
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

  function handleCategoryFilter(val: string) {
    setCategoryFilter(val);
    setPage(1);
  }

  const products: TProduct[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;
  const total = meta?.total ?? 0;
  const categories: TCategory[] = catData?.data ?? [];

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

  const columns = [
    col.display({
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
              {p.image
                ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                : <Package size={14} className="text-slate-600" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{p.name}</p>
              <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("category", {
      header: "Category",
      cell: (info) => {
        const cat = info.getValue();
        return cat
          ? <span className="px-2 py-0.5 rounded-md text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">{cat.name}</span>
          : <span className="text-slate-600 text-xs">—</span>;
      },
    }),
    col.accessor("purchasePrice", {
      header: "Buy",
      cell: (info) => <span className="text-slate-400 text-sm">${info.getValue().toFixed(2)}</span>,
    }),
    col.accessor("sellingPrice", {
      header: "Sell",
      cell: (info) => <span className="text-emerald-400 text-sm font-medium">${info.getValue().toFixed(2)}</span>,
    }),
    col.accessor("stockQuantity", {
      header: "Stock",
      cell: (info) => {
        const qty = info.getValue();
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
            qty === 0
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : qty <= 10
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {qty}
          </span>
        );
      },
    }),
    col.accessor("createdAt", {
      header: "Created",
      cell: (info) => {
        const v = info.getValue();
        return <span className="text-slate-500 text-xs whitespace-nowrap">{v ? formatDate(v) : "—"}</span>;
      },
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const product = row.original;
        const isBeingDeleted = deletingId === product._id;
        return (
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => setViewProduct(product)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors" title="View">
              <Eye size={14} />
            </button>
            {canUpdate && (
              <button onClick={() => setEditProduct(product)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Edit">
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button onClick={() => setDeleteProduct(product)} disabled={isBeingDeleted} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Delete">
                {isBeingDeleted ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({ data: products, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Products</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your product inventory</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            Add Product
          </button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && !isError && meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Products</p>
            <p className="text-2xl font-semibold text-white mt-0.5">{total}</p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">In Stock</p>
            <p className="text-2xl font-semibold text-emerald-400 mt-0.5">
              {products.filter((p) => p.stockQuantity > 0).length}
            </p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Low Stock</p>
            <p className="text-2xl font-semibold text-amber-400 mt-0.5">
              {products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10).length}
            </p>
          </div>
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Out of Stock</p>
            <p className="text-2xl font-semibold text-red-400 mt-0.5">
              {products.filter((p) => p.stockQuantity === 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0f0f13] border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={14} />
            </button>
          )}
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="sm:w-48 px-3.5 py-2.5 rounded-xl bg-[#0f0f13] border border-white/10 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none text-white"
        >
          <option value="" className="bg-[#0f0f13]">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="bg-[#0f0f13] capitalize">{c.name}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Failed to load products</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isError && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Package size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No products found</p>
              <p className="text-slate-600 text-xs mt-1">
                {search || categoryFilter ? "Try adjusting your filters" : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-white/10 bg-white/[0.02]">
                      {hg.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, i) => (
                    <tr key={row.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
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
          )}

          {/* Pagination */}
          {!isLoading && totalPage > 1 && (
            <div className="px-4 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPage} · {total} products
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
                      <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
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
      <ViewProductModal open={!!viewProduct} product={viewProduct} onClose={() => setViewProduct(null)} />
      <CreateProductModal open={createOpen} categories={categories} onClose={() => setCreateOpen(false)} />
      <UpdateProductModal open={!!editProduct} product={editProduct} categories={categories} onClose={() => setEditProduct(null)} />
      <DeleteProductModal
        open={!!deleteProduct}
        product={deleteProduct}
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteProduct(null)}
      />
    </div>
  );
}
