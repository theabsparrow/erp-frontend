import type { TPermissions } from "./types.permission";

export type TRoleStatus = "active" | "freeze";

export type TRole = {
  _id: string;
  name: string;
  description: string;
  status: TRoleStatus;
  permissions: string[];
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateRolePayload = {
  name: string;
  description: string;
  permissions?: string[];
};

export type TUpdateRolePayload = {
  name?: string;
  description?: string;
  status?: TRoleStatus;
  addPermissions?: string[];
  removePermissions?: string[];
};

export type TRolesResponse = {
  data: {
    roles: TRole[];
    permissions: TPermissions[];
  };
};

export type TRoleResponse = {
  data: TRole;
};
