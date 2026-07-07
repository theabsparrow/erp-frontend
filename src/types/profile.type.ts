export interface ProfileResponse {
  data: {
    _id: string;
    name: string;
    email: string;
    role: {
      _id: string;
      name: string;
      permissions: string[];
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
