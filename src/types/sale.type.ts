export type TSaleProductSnapshot = {
  productId: string;
  name: string;
  sku: string;
  image?: string;
  sellingPrice: number;
  quantity: number;
  subtotal: number;
};

export type TSale = {
  _id: string;
  soldBy: { _id: string; name: string; email: string } | null;
  items: TSaleProductSnapshot[];
  grandTotal: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TSaleItemInput = {
  productId: string;
  quantity: number;
};

export type TCreateSalePayload = {
  items: TSaleItemInput[];
};

export type TSaleMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TSalesResponse = {
  data: TSale[];
  meta: TSaleMeta;
};

export type TSaleResponse = {
  data: TSale;
};
