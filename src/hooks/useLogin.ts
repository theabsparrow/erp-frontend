import { useMutate } from "@/hooks/useMutate";
import type { LoginPayload, LoginResponse } from "@/api/auth";

export function useLogin() {
  return useMutate<LoginResponse, LoginPayload>("POST", "/auth/login");
}
