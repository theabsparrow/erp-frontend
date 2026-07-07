import type { TProduct } from "@/types/product.type";
import { formatDate } from "@/utills/formatDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Tag, FolderOpen, DollarSign, Layers, Calendar } from "lucide-react";

interface Props {
  open: boolean;
  product: TProduct | null;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm text-white mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

export function ViewProductModal({ open, product, onClose }: Props) {
  if (!product) return null;

  const margin = product.sellingPrice > 0
    ? (((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100).toFixed(1)
    : "0.0";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-md gap-0"
      >
        <DialogHeader className="flex-row items-center px-6 py-4 border-b border-white/10 gap-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Package size={13} className="text-sky-400" />
            </div>
            <DialogTitle className="text-white text-base">Product Details</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Image + name hero */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
              {product.image
                ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                : <Package size={22} className="text-slate-600" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white truncate">{product.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{product.sku}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1.5 ${
                product.stockQuantity > 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-xl border border-white/8 px-4">
            <InfoRow icon={FolderOpen} label="Category" value={
              product.category
                ? <span className="capitalize">{product.category.name}</span>
                : <span className="text-slate-500">Uncategorized</span>
            } />
            <InfoRow icon={DollarSign} label="Purchase Price" value={`$${product.purchasePrice.toFixed(2)}`} />
            <InfoRow icon={DollarSign} label="Selling Price" value={`$${product.sellingPrice.toFixed(2)}`} />
            <InfoRow icon={Tag} label="Profit Margin" value={
              <span className="text-emerald-400">{margin}%</span>
            } />
            <InfoRow icon={Layers} label="Stock Quantity" value={
              <span className={product.stockQuantity === 0 ? "text-red-400" : "text-white"}>
                {product.stockQuantity} units
              </span>
            } />
            {product.createdAt && (
              <InfoRow icon={Calendar} label="Created" value={formatDate(product.createdAt)} />
            )}
          </div>
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
