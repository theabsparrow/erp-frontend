import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Tag,
  FolderOpen,
  DollarSign,
  Layers,
  Calendar,
  AlertCircle,
  Hash,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import type { TProductResponse } from "@/types/product.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utills/formatDate";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm text-white mt-0.5 wrap-break-word">{value}</div>
      </div>
    </div>
  );
}

export function ProductDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGet<TProductResponse>(
    ["product", id],
    `/products/${id}`,
    { enabled: !!id },
  );

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-white/5 rounded-xl" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError || !product) {
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
          <p className="text-white font-medium">Product not found</p>
          <p className="text-slate-400 text-sm">
            This product may have been deleted or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  const margin =
    product.sellingPrice > 0
      ? (
          ((product.sellingPrice - product.purchasePrice) /
            product.sellingPrice) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white">Product Details</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {product.sku}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Purchase Price</p>
          <p className="text-xl font-bold text-white mt-0.5">
            ${product.purchasePrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Selling Price</p>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">
            ${product.sellingPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Profit Margin</p>
          <p className="text-xl font-bold text-violet-400 mt-0.5">{margin}%</p>
        </div>
        <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">Stock</p>
          <p
            className={`text-xl font-bold mt-0.5 ${product.stockQuantity === 0 ? "text-red-400" : product.stockQuantity <= 10 ? "text-amber-400" : "text-white"}`}
          >
            {product.stockQuantity}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Image + details */}
        <div className="lg:col-span-2 bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          {/* Hero image */}
          <div className="w-full h-48 sm:h-64 bg-white/2 border-b border-white/10 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-700">
                <Package size={48} />
                <p className="text-xs">No image</p>
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {product.name}
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {product.sku}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
                  product.stockQuantity === 0
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : product.stockQuantity <= 10
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {product.stockQuantity === 0
                  ? "Out of Stock"
                  : product.stockQuantity <= 10
                    ? "Low Stock"
                    : "In Stock"}
              </span>
            </div>

            <div className="bg-white/2 rounded-xl border border-white/8 px-4">
              <InfoRow
                icon={FolderOpen}
                label="Category"
                value={
                  product.category ? (
                    <span className="capitalize">{product.category.name}</span>
                  ) : (
                    <span className="text-slate-500">Uncategorized</span>
                  )
                }
              />
              <InfoRow
                icon={DollarSign}
                label="Purchase Price"
                value={`$${product.purchasePrice.toFixed(2)}`}
              />
              <InfoRow
                icon={DollarSign}
                label="Selling Price"
                value={
                  <span className="text-emerald-400">
                    ${product.sellingPrice.toFixed(2)}
                  </span>
                }
              />
              <InfoRow
                icon={Tag}
                label="Profit Margin"
                value={<span className="text-violet-400">{margin}%</span>}
              />
              <InfoRow
                icon={Layers}
                label="Stock Quantity"
                value={
                  <span
                    className={
                      product.stockQuantity === 0 ? "text-red-400" : ""
                    }
                  >
                    {product.stockQuantity} units
                  </span>
                }
              />
              {product.createdAt && (
                <InfoRow
                  icon={Calendar}
                  label="Created"
                  value={formatDate(product.createdAt)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Side info */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-5 space-y-4 h-fit">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Product Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-2 text-sm">
              <span className="text-slate-500 shrink-0">ID</span>
              <span className="font-mono text-xs text-slate-300 text-right break-all">
                {product._id}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">SKU</span>
              <span className="font-mono text-xs text-slate-300">
                {product.sku}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Category</span>
              <span className="text-white capitalize">
                {product.category?.name ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-white/8 pt-3">
              <span className="text-slate-500">Status</span>
              <span
                className={`text-xs font-medium ${product.stockQuantity === 0 ? "text-red-400" : "text-emerald-400"}`}
              >
                {product.stockQuantity === 0 ? "Out of Stock" : "Available"}
              </span>
            </div>
            {product.updatedAt && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1">
                  <Hash size={11} />
                  Updated
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(product.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
