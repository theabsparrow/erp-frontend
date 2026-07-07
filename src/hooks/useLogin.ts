import { useMutation } from "@tanstack/react-query";
import { loginApi, type LoginPayload, type LoginResponse } from "@/api/auth";

export function useLogin() {
  return useMutation<LoginResponse, unknown, { body: LoginPayload }>({
    mutationFn: ({ body }) => loginApi(body),
  });
}
