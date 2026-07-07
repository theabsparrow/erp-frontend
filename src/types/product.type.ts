export type TProduct = {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string } | null;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TProductMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TProductsResponse = {
  data: TProduct[];
  meta: TProductMeta;
};

export type TProductResponse = {
  data: TProduct;
};
