export type TUserStatus = "active" | "block";

export type TUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: { _id: string; name: string } | null;
  profilePicture?: string;
  status: TUserStatus;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateUserPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  profilePicture?: string;
  status?: TUserStatus;
};

export type TUserMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TUsersResponse = {
  data: TUser[];
  meta: TUserMeta;
};

export type TUserResponse = {
  data: TUser;
};
