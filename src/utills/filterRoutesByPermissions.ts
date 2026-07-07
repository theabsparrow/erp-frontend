import { type NavRoute } from "@/constants/navigationRoute";

export function filterRoutesByPermissions(
  routes: NavRoute[],
  userPermissions: string[]
): NavRoute[] {
  return routes.filter(
    (route) =>
      !route.permissions ||
      route.permissions.some((p) => userPermissions.includes(p))
  );
}
