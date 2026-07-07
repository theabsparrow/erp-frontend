import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Package, User, Calendar, Hash,
  DollarSign, ShoppingBag, AlertCircle, ExternalLink,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import type { TSaleResponse } from "@/types/sale.type";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function SalesDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGet<TSaleResponse>(
    ["sales", id],
    `/sales/${id}`,
    { enabled: !!id }
  );

  const sale = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-white/5 rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="bg-[#0f0f13] border border-red-500/20 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-white font-medium">Sale not found</p>
          <p className="text-slate-400 text-sm">This sale may have been deleted or the ID is invalid.</p>
        </div>
      </div>
    );
  }

  const totalUnits = sale.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Sale Details</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              #{sale._id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>
        {sale.createdAt && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 shrink-0">
            <Calendar size={13} className="text-slate-500" />
            {formatDateTime(sale.createdAt)}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Grand Total</p>
          <p className="text-2xl font-bold text-emerald-400 mt-0.5">${sale.grandTotal.toFixed(2)}</p>
        </div>
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Products</p>
          <p className="text-2xl font-semibold text-white mt-0.5">{sale.items.length}</p>
        </div>
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500">Total Units</p>
          <p className="text-2xl font-semibold text-violet-400 mt-0.5">{totalUnits}</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Items — takes 2/3 on large */}
        <div className="lg:col-span-2 bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <ShoppingBag size={14} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Items Sold</h2>
            <span className="ml-auto text-xs text-slate-500">{sale.items.length} product{sale.items.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="col-span-5">Product</span>
            <span className="col-span-2 text-right">Unit Price</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Subtotal</span>
            <span className="col-span-1"></span>
          </div>

          <div className="divide-y divide-white/5">
            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center px-5 py-4">
                {/* Product info */}
                <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <Package size={16} className="text-slate-600" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                  </div>
                </div>

                {/* Unit price */}
                <div className="col-span-4 sm:col-span-2 text-right">
                  <p className="text-xs text-slate-500 sm:hidden">Unit Price</p>
                  <p className="text-sm text-slate-300">${item.sellingPrice.toFixed(2)}</p>
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2 text-center">
                  <p className="text-xs text-slate-500 sm:hidden">Qty</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    ×{item.quantity}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="col-span-3 sm:col-span-2 text-right">
                  <p className="text-xs text-slate-500 sm:hidden">Subtotal</p>
                  <p className="text-sm font-semibold text-emerald-400">${item.subtotal.toFixed(2)}</p>
                </div>

                {/* Link to product */}
                <div className="col-span-1 flex justify-end">
                  <Link
                    to={`/products/${item.productId}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                    title="View product"
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Grand total footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <DollarSign size={14} />
              Grand Total
            </div>
            <span className="text-xl font-bold text-emerald-400">${sale.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Sold By card — 1/3 on large */}
        <div className="space-y-4">
          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <User size={14} className="text-sky-400" />
              <h2 className="text-sm font-semibold text-white">Sold By</h2>
            </div>

            {sale.soldBy ? (
              <div className="p-5 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-violet-300">
                      {sale.soldBy.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{sale.soldBy.name}</p>
                    <p className="text-xs text-slate-500 truncate">{sale.soldBy.email}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2.5 py-2 border-b border-white/5">
                    <Hash size={12} className="text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">User ID</p>
                      <p className="text-xs font-mono text-slate-300 truncate">{sale.soldBy._id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 py-2">
                    <Calendar size={12} className="text-slate-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Sale recorded</p>
                      <p className="text-xs text-slate-300">{sale.createdAt ? formatDateTime(sale.createdAt) : "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Link to user details */}
                <Link
                  to={`/users/${sale.soldBy._id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                >
                  <ExternalLink size={13} />
                  View User Profile
                </Link>
              </div>
            ) : (
              <div className="p-5 flex flex-col items-center text-center gap-2">
                <User size={24} className="text-slate-700" />
                <p className="text-slate-500 text-sm">User not found</p>
              </div>
            )}
          </div>

          {/* Sale meta card */}
          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sale Info</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Sale ID</span>
                <span className="font-mono text-xs text-slate-300">#{sale._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Products</span>
                <span className="text-white">{sale.items.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Units</span>
                <span className="text-white">{totalUnits}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/8 pt-2.5 mt-1">
                <span className="text-slate-400 font-medium">Grand Total</span>
                <span className="text-emerald-400 font-bold">${sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
