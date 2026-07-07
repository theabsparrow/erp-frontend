import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus, Trash2, AlertCircle, ShoppingCart, Package,
  Search, X, ChevronDown, ChevronUp, Loader2, Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGet } from "@/hooks/useGet";
import { useMutate } from "@/hooks/useMutate";
import { useQueryClient } from "@tanstack/react-query";
import type { TProduct, TProductsResponse } from "@/types/product.type";
import type { TSale, TSalesResponse, TSaleResponse, TCreateSalePayload } from "@/types/sale.type";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/provider/AuthProvider";
import { PERMISSIONS } from "@/constants/permissions";
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

// ── Types ────────────────────────────────────────────────────────────────────
type CartItem = {
  product: TProduct;
  quantity: number;
};

const col = createColumnHelper<TSale>();
const LIMIT = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getPageNumbers(page: number, totalPage: number): (number | "ellipsis")[] {
  if (totalPage <= 7) return Array.from({ length: totalPage }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (page > 3) pages.push("ellipsis");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPage - 1, page + 1); i++) pages.push(i);
  if (page < totalPage - 2) pages.push("ellipsis");
  pages.push(totalPage);
  return pages;
}

// ── Component ────────────────────────────────────────────────────────────────
export function SalesComponent() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canCreate = perms.includes(PERMISSIONS.CREATE_SALE);
  const queryClient = useQueryClient();

  // ── Product search state ──
  const [productSearch, setProductSearch] = useState("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [showProductList, setShowProductList] = useState(false);

  // ── Cart state ──
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Sales history pagination ──
  const [page, setPage] = useState(1);

  // ── Expanded sale row ──
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch products for search ──
  const { data: productData, isLoading: productsLoading } = useGet<TProductsResponse>(
    ["products-search", productSearch],
    "/products",
    { params: { searchTerm: productSearch || undefined, limit: 20 }, enabled: showProductList }
  );

  // ── Fetch sales history ──
  const { data: salesData, isLoading: salesLoading, isError: salesError } = useGet<TSalesResponse>(
    ["sales"],
    "/sales",
    { params: { page, limit: LIMIT } }
  );

  // ── Create sale mutation ──
  const { mutate: createSale, isPending } = useMutate<TSaleResponse, TCreateSalePayload>(
    "POST",
    "/sales",
    {
      invalidateKeys: [["sales"]],
      onSuccess: () => {
        // also invalidate products so stock updates reflect immediately
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success("Sale recorded successfully");
        setCart([]);
        setPage(1);
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to create sale")
          : "Something went wrong";
        toast.error(msg);
      },
    }
  );

  // ── Cart helpers ──
  function addToCart(product: TProduct) {
    if (product.stockQuantity === 0) {
      toast.error(`"${product.name}" is out of stock`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error(`Only ${product.stockQuantity} units available`);
          return prev;
        }
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowProductList(false);
    setProductSearchInput("");
    setProductSearch("");
  }

  function updateQty(productId: string, qty: number) {
    const item = cart.find((i) => i.product._id === productId);
    if (!item) return;
    if (qty < 1) { removeFromCart(productId); return; }
    if (qty > item.product.stockQuantity) {
      toast.error(`Only ${item.product.stockQuantity} units available`);
      return;
    }
    setCart((prev) => prev.map((i) => i.product._id === productId ? { ...i, quantity: qty } : i));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product._id !== productId));
  }

  function handleProductSearch(e: React.FormEvent) {
    e.preventDefault();
    setProductSearch(productSearchInput.trim());
  }

  const grandTotal = cart.reduce((sum, i) => sum + i.product.sellingPrice * i.quantity, 0);

  function handleSubmit() {
    if (cart.length === 0) { toast.error("Add at least one product"); return; }
    createSale({
      body: {
        items: cart.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
      },
    });
  }

  // ── Sales table ──
  const sales: TSale[] = salesData?.data ?? [];
  const meta = salesData?.meta;
  const totalPage = meta?.totalPage ?? 1;
  const total = meta?.total ?? 0;

  const products: TProduct[] = productData?.data ?? [];

  const navigate = useNavigate();

  const columns = [
    col.display({
      id: "expand",
      header: () => null,
      cell: ({ row }) => {
        const sale = row.original;
        const isExpanded = expandedId === sale._id;
        return (
          <button
            onClick={() => setExpandedId(isExpanded ? null : sale._id)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        );
      },
    }),
    col.accessor("_id", {
      header: "Sale ID",
      cell: (info) => (
        <span className="text-xs font-mono text-slate-400">#{info.getValue().slice(-8).toUpperCase()}</span>
      ),
    }),
    col.accessor("soldBy", {
      header: "Sold By",
      cell: (info) => {
        const s = info.getValue();
        return s ? (
          <div>
            <p className="text-sm text-white font-medium">{s.name}</p>
            <p className="text-xs text-slate-500">{s.email}</p>
          </div>
        ) : <span className="text-slate-600 text-xs">—</span>;
      },
    }),
    col.accessor("items", {
      header: "Items",
      cell: (info) => {
        const items = info.getValue();
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        );
      },
    }),
    col.accessor("grandTotal", {
      header: "Grand Total",
      cell: (info) => (
        <span className="text-emerald-400 font-semibold text-sm">${info.getValue().toFixed(2)}</span>
      ),
    }),
    col.accessor("createdAt", {
      header: "Date & Time",
      cell: (info) => {
        const v = info.getValue();
        return <span className="text-slate-400 text-xs whitespace-nowrap">{v ? formatDateTime(v) : "—"}</span>;
      },
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/sales/${row.original._id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
        >
          <Eye size={12} />
          View
        </button>
      ),
    }),
  ];

  const table = useReactTable({ data: sales, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-semibold text-white">Sales</h1>
        <p className="text-sm text-slate-400 mt-0.5">Record new sales and view history</p>
      </div>

      {/* ── Create Sale Form ── */}
      {canCreate && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          {/* Form header */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <ShoppingCart size={13} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">New Sale</h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Product search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Add Products</label>
              <div className="relative">
                <form onSubmit={handleProductSearch} className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    value={productSearchInput}
                    onChange={(e) => setProductSearchInput(e.target.value)}
                    onFocus={() => setShowProductList(true)}
                    placeholder="Search product by name or SKU…"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  {productSearchInput && (
                    <button
                      type="button"
                      onClick={() => { setProductSearchInput(""); setProductSearch(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>

                {/* Dropdown results */}
                {showProductList && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-[#0f0f13] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto">
                      {productsLoading ? (
                        <div className="p-4 space-y-2">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-lg" />)}
                        </div>
                      ) : products.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No products found</div>
                      ) : (
                        products.map((p) => {
                          const inCart = cart.find((c) => c.product._id === p._id);
                          const outOfStock = p.stockQuantity === 0;
                          return (
                            <button
                              key={p._id}
                              type="button"
                              onClick={() => addToCart(p)}
                              disabled={outOfStock}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed border-b border-white/5 last:border-0"
                            >
                              <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                {p.image
                                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  : <Package size={13} className="text-slate-600" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{p.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm text-emerald-400 font-medium">${p.sellingPrice.toFixed(2)}</p>
                                <p className={`text-xs ${p.stockQuantity === 0 ? "text-red-400" : "text-slate-500"}`}>
                                  {outOfStock ? "Out of stock" : `${p.stockQuantity} left`}
                                </p>
                              </div>
                              {inCart && (
                                <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 shrink-0">
                                  In cart
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductList(false)}
                      className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 border-t border-white/10 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="col-span-5">Product</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-3 text-center">Qty</span>
                  <span className="col-span-1 text-right">Sub</span>
                  <span className="col-span-1"></span>
                </div>

                <div className="space-y-2">
                  {cart.map((item) => {
                    const subtotal = item.product.sellingPrice * item.quantity;
                    return (
                      <div
                        key={item.product._id}
                        className="grid grid-cols-12 gap-2 items-center bg-white/[0.03] border border-white/8 rounded-xl px-3 py-3"
                      >
                        {/* Product */}
                        <div className="col-span-12 sm:col-span-5 flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.product.image
                              ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              : <Package size={12} className="text-slate-600" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{item.product.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{item.product.sku}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-4 sm:col-span-2 text-center">
                          <span className="text-xs text-slate-500 sm:hidden">Price: </span>
                          <span className="text-sm text-slate-300">${item.product.sellingPrice.toFixed(2)}</span>
                        </div>

                        {/* Qty controls */}
                        <div className="col-span-5 sm:col-span-3 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQty(item.product._id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors flex items-center justify-center text-base leading-none"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => updateQty(item.product._id, Number(e.target.value))}
                            className="w-12 text-center bg-white/5 border border-white/10 rounded-lg py-1 text-sm text-white outline-none focus:border-violet-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(item.product._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors flex items-center justify-center text-base leading-none"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 sm:col-span-1 text-right">
                          <span className="text-sm text-emerald-400 font-medium">${subtotal.toFixed(2)}</span>
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand total + submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10 mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Grand Total</span>
                    <span className="text-2xl font-bold text-emerald-400">${grandTotal.toFixed(2)}</span>
                    <span className="text-xs text-slate-500">
                      {cart.reduce((s, i) => s + i.quantity, 0)} unit{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                    >
                      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      {isPending ? "Recording…" : "Record Sale"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-xl">
                <ShoppingCart size={28} className="text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">Cart is empty</p>
                <p className="text-slate-600 text-xs mt-0.5">Search and add products above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sales History ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Sales History</h2>
          {!salesLoading && meta && (
            <span className="text-xs text-slate-500">{total} total sales</span>
          )}
        </div>

        {salesError && (
          <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-5 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-white text-sm">Failed to load sales history</p>
          </div>
        )}

        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          {salesLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart size={28} className="text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No sales recorded yet</p>
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
                  {table.getRowModel().rows.map((row, i) => {
                    const sale = row.original;
                    const isExpanded = expandedId === sale._id;
                    return (
                      <>
                        <tr
                          key={row.id}
                          className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-white/[0.02]"} ${isExpanded ? "bg-white/[0.04]" : ""}`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 align-middle">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>

                        {/* Expanded items row */}
                        {isExpanded && (
                          <tr key={`${row.id}-expanded`} className="bg-white/[0.02] border-b border-white/5">
                            <td colSpan={columns.length} className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Items in this sale</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {sale.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5">
                                      <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                        {item.image
                                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          : <Package size={12} className="text-slate-600" />
                                        }
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{item.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-xs text-slate-400">×{item.quantity}</p>
                                        <p className="text-xs text-emerald-400 font-medium">${item.subtotal.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end pt-2 border-t border-white/8 mt-2">
                                  <span className="text-xs text-slate-400 mr-2">Grand Total:</span>
                                  <span className="text-sm font-bold text-emerald-400">${sale.grandTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!salesLoading && totalPage > 1 && (
            <div className="px-4 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Page {page} of {totalPage} · {total} sales</p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                      className={page === 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                  {getPageNumbers(page, totalPage).map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
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
      </div>
    </div>
  );
}
