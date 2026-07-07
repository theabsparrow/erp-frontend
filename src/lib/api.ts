import axiosInstance from "@/lib/axios";

// builds the url: /route or /route/id
function buildUrl(route: string, id?: string | number): string {
  return id !== undefined ? `${route}/${id}` : route;
}

export async function apiGet<TResponse>(
  route: string,
  id?: string | number,
  params?: Record<string, unknown>,
): Promise<TResponse> {
  const { data } = await axiosInstance.get<TResponse>(buildUrl(route, id), {
    params,
  });
  return data;
}

export async function apiPost<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  id?: string | number,
): Promise<TResponse> {
  const { data } = await axiosInstance.post<TResponse>(
    buildUrl(route, id),
    body ?? {},
  );
  return data;
}

export async function apiPatch<TResponse, TBody = unknown>(
  route: string,
  id?: string | number,
  body?: TBody,
): Promise<TResponse> {
  const { data } = await axiosInstance.patch<TResponse>(
    buildUrl(route, id),
    body ?? {},
  );
  return data;
}

export async function apiDelete<TResponse>(
  route: string,
  id?: string | number,
  body?: unknown,
): Promise<TResponse> {
  const { data } = await axiosInstance.delete<TResponse>(buildUrl(route, id), {
    data: body,
  });
  return data;
}

export async function apiPostFormData<TResponse>(
  route: string,
  formData?: FormData,
): Promise<TResponse> {
  const { data } = await axiosInstance.post<TResponse>(
    route,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function apiPatchFormData<TResponse>(
  route: string,
  id?: string | number,
  formData?: FormData,
): Promise<TResponse> {
  const { data } = await axiosInstance.patch<TResponse>(
    buildUrl(route, id),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
