export type TCategory = {
  _id: string;
  name: string;
  description: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateCategoryPayload = {
  name: string;
  description: string;
};

export type TUpdateCategoryPayload = {
  name?: string;
  description?: string;
};

export type TCategoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TCategoriesResponse = {
  data: TCategory[];
  meta: TCategoryMeta;
};

export type TCategoryResponse = {
  data: TCategory;
};
