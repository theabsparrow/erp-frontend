/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatchFormData } from "@/lib/api";
import type { TProduct, TProductResponse } from "@/types/product.type";
import type { TCategory } from "@/types/category.type";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.coerce.number().min(0, "Must be ≥ 0"),
  sellingPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  stockQuantity: z.coerce.number().min(0, "Must be ≥ 0"),
});

type FormValues = {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
};

interface Props {
  open: boolean;
  product: TProduct | null;
  categories: TCategory[];
  onClose: () => void;
}

export function UpdateProductModal({ open, product, categories, onClose }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<TProductResponse, unknown, FormData>({
    mutationFn: (fd) => apiPatchFormData<TProductResponse>("/products", product?._id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      handleClose();
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to update product")
        : "Something went wrong";
      toast.error(msg);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues> });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        category: product.category?._id ?? "",
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
      });
      setPreviewUrl(product.image ?? null);
      setSelectedFile(null);
    }
  }, [product, reset]);

  function handleClose() {
    reset();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearFile() {
    setSelectedFile(null);
    setPreviewUrl(product?.image ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(values: FormValues) {
    if (values.sellingPrice <= values.purchasePrice) {
      setError("sellingPrice", { message: "Selling price must be greater than purchase price" });
      return;
    }
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("sku", values.sku);
    fd.append("category", values.category);
    fd.append("purchasePrice", String(values.purchasePrice));
    fd.append("sellingPrice", String(values.sellingPrice));
    fd.append("stockQuantity", String(values.stockQuantity));
    if (selectedFile) fd.append("image", selectedFile);
    mutate(fd);
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0f0f13] border border-white/10 text-white p-0 sm:max-w-lg max-h-[90vh] flex flex-col gap-0"
      >
        <DialogHeader className="flex-row items-center px-6 py-4 border-b border-white/10 gap-0 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Pencil size={13} className="text-amber-400" />
            </div>
            <DialogTitle className="text-white text-base">Update Product</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <form id="update-product-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Image upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                  {previewUrl
                    ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    : <span className="text-slate-600 text-xs">No image</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="update-product-image" />
                  <label htmlFor="update-product-image" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors">
                    <Upload size={12} />
                    {selectedFile ? "Change" : "Replace"}
                  </label>
                  {selectedFile && (
                    <button type="button" onClick={clearFile} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Name + SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Name <span className="text-red-400">*</span></label>
                <input {...register("name")} className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">SKU <span className="text-red-400">*</span></label>
                <input {...register("sku")} className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Category <span className="text-red-400">*</span></label>
              <select {...register("category")} className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none">
                <option value="" className="bg-[#0f0f13]">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#0f0f13] capitalize">{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Purchase Price <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input {...register("purchasePrice")} type="number" step="0.01" min="0" className="w-full pl-7 pr-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
                {errors.purchasePrice && <p className="text-xs text-red-400">{errors.purchasePrice.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Selling Price <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input {...register("sellingPrice")} type="number" step="0.01" min="0" className="w-full pl-7 pr-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
                {errors.sellingPrice && <p className="text-xs text-red-400">{errors.sellingPrice.message}</p>}
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Stock Quantity <span className="text-red-400">*</span></label>
              <input {...register("stockQuantity")} type="number" min="0" className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
              {errors.stockQuantity && <p className="text-xs text-red-400">{errors.stockQuantity.message}</p>}
            </div>
          </form>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" form="update-product-form" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
