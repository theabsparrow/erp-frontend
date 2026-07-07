import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGet } from "@/hooks/useGet";
import { apiPatchFormData } from "@/lib/api";
import type { TProductResponse } from "@/types/product.type";
import type { TCategoriesResponse, TCategory } from "@/types/category.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utills/formatDate";
import { useAuth } from "@/provider/AuthProvider";
import { PERMISSIONS } from "@/constants/permissions";
import { toast } from "sonner";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  FolderOpen,
  Hash,
  Layers,
  Loader2,
  Package,
  Pencil,
  Tag,
  Upload,
  X,
} from "lucide-react";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.coerce.number().min(0, "Must be ≥ 0"),
  sellingPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  stockQuantity: z.coerce.number().min(0, "Must be ≥ 0"),
});
type FormValues = z.infer<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

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
        <div className="text-sm text-white mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
        <Skeleton className="h-56 bg-white/5 rounded-2xl" />
      </div>
      <Skeleton className="h-72 bg-white/5 rounded-2xl" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ProductDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();
  const canUpdate = (authUser?.permissions ?? []).includes(
    PERMISSIONS.UPDATE_PRODUCT
  );

  // ── Fetch product ──
  const { data, isLoading, isError } = useGet<TProductResponse>(
    ["product", id],
    `/products/${id}`,
    { enabled: !!id }
  );

  // ── Fetch categories ──
  const { data: catData } = useGet<TCategoriesResponse>(
    ["categories-all"],
    "/categories",
    { params: { limit: 999 } }
  );
  const categories: TCategory[] = catData?.data ?? [];

  // ── Image state ──
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form ──
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  const product = data?.data;

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

  // ── Mutation ──
  const { mutate, isPending } = useMutation<TProductResponse, unknown, FormData>(
    {
      mutationFn: (fd) =>
        apiPatchFormData<TProductResponse>("/products", id, fd),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["product", id] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success("Product updated successfully");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Failed to update product")
          : "Something went wrong";
        toast.error(msg);
      },
    }
  );

  function onSubmit(values: FormValues) {
    if (values.sellingPrice <= values.purchasePrice) {
      setError("sellingPrice", {
        message: "Selling price must be greater than purchase price",
      });
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

  // ── States ──
  if (isLoading) return <DetailsSkeleton />;

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

  const stockColor =
    product.stockQuantity === 0
      ? "text-red-400"
      : product.stockQuantity <= 10
        ? "text-amber-400"
        : "text-white";

  const stockBadge =
    product.stockQuantity === 0
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : product.stockQuantity <= 10
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  const stockLabel =
    product.stockQuantity === 0
      ? "Out of Stock"
      : product.stockQuantity <= 10
        ? "Low Stock"
        : "In Stock";

  const imageSrc = previewUrl ?? product.image ?? null;

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
          <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
        </div>
      </div>

      {/* Stat cards */}
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
          <p className={`text-xl font-bold mt-0.5 ${stockColor}`}>
            {product.stockQuantity}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Image + info rows */}
        <div className="lg:col-span-2 bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="w-full h-48 sm:h-64 bg-white/[0.02] border-b border-white/10 flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
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
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${stockBadge}`}
              >
                {stockLabel}
              </span>
            </div>

            <div className="bg-white/[0.02] rounded-xl border border-white/8 px-4">
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
                  <span className={product.stockQuantity === 0 ? "text-red-400" : ""}>
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

      {/* Update form */}
      {canUpdate && (
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Pencil size={13} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Update Product</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* Image upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-slate-600" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-image-input"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="product-image-input"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <Upload size={12} />
                    {selectedFile ? "Change image" : "Replace image"}
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  JPG, PNG, WEBP up to 5MB
                </p>
              </div>
            </div>

            {/* Name + SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  placeholder="Product name"
                  className={inputCls}
                />
              </Field>
              <Field label="SKU" error={errors.sku?.message}>
                <input
                  {...register("sku")}
                  placeholder="SKU-001"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Category */}
            <Field label="Category" error={errors.category?.message}>
              <div className="relative">
                <FolderOpen
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <select
                  {...register("category")}
                  className={`${inputCls} pl-9 appearance-none`}
                >
                  <option value="" className="bg-[#0f0f13]">
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                      className="bg-[#0f0f13] capitalize"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Purchase Price" error={errors.purchasePrice?.message}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    $
                  </span>
                  <input
                    {...register("purchasePrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </Field>
              <Field label="Selling Price" error={errors.sellingPrice?.message}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    $
                  </span>
                  <input
                    {...register("sellingPrice")}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </Field>
            </div>

            {/* Stock */}
            <Field label="Stock Quantity" error={errors.stockQuantity?.message}>
              <div className="relative">
                <Layers
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  {...register("stockQuantity")}
                  type="number"
                  min="0"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
