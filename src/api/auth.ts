import axiosInstance, { publicAxios } from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
  };
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await publicAxios.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function logoutApi(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}
