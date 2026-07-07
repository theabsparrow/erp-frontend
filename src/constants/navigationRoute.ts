import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  TrendingUp,
  Users,
  Shield,
  type LucideIcon,
  User2,
} from "lucide-react";
import type { Permission } from "./permissions";

export interface NavRoute {
  title: string;
  path: string;
  icon: LucideIcon;
  permissions?: Permission[]; // any one of these is enough to show the route
}

export const navigationRoutes: NavRoute[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Profile", icon: User2, path: "/profile" },
  { title: "Categories", icon: FolderOpen, path: "/categories", permissions: ["view_category"] },
  { title: "Products", icon: ShoppingBag, path: "/products", permissions: ["view_product"] },
  { title: "Sales", icon: TrendingUp, path: "/sales", permissions: ["view_sale"] },
  { title: "Users", icon: Users, path: "/users", permissions: ["view_user"] },
  { title: "Roles", icon: Shield, path: "/roles", permissions: ["view_role"] },
];
