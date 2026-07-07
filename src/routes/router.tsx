import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "@/provider/AuthProvider";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Layout from "../layouts/Layout";
import NotFound from "../pages/notFound/NotFound";
import LoginPage from "../pages/login/LoginPage";
import HomePage from "../pages/home/HomePage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import ProductsPage from "../pages/products/ProductsPage";
import SalesPage from "../pages/sales/SalesPage";
import UsersPage from "../pages/users/UsersPage";
import RolesPage from "../pages/roles/RolesPage";
import Profile from "@/pages/profile/Profile";
import SalesDetails from "@/pages/salesDetails/SalesDetails";
import UserDetails from "@/pages/userDetails/UserDetails";
import ProductDetails from "@/pages/productDetails/ProductDetails";

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <NotFound />,
    children: [
      {
        element: <Layout />,
        children: [
          // Any authenticated user
          {
            element: <ProtectedRoute />,
            children: [
              { path: "/", element: <HomePage /> },
              { path: "/profile", element: <Profile /> },
            ],
          },
          // Permission-guarded routes
          {
            element: <ProtectedRoute permission="view_product" />,
            children: [{ path: "/products", element: <ProductsPage /> }],
          },
          {
            element: <ProtectedRoute permission="view_product" />,
            children: [{ path: "/products/:id", element: <ProductDetails /> }],
          },
          {
            element: <ProtectedRoute permission="view_category" />,
            children: [{ path: "/categories", element: <CategoriesPage /> }],
          },

          {
            element: <ProtectedRoute permission="view_sale" />,
            children: [{ path: "/sales", element: <SalesPage /> }],
          },
          {
            element: <ProtectedRoute permission="view_sale" />,
            children: [{ path: "/sales/:id", element: <SalesDetails /> }],
          },
          {
            element: <ProtectedRoute permission="view_user" />,
            children: [{ path: "/users", element: <UsersPage /> }],
          },
          {
            element: <ProtectedRoute permission="view_user" />,
            children: [{ path: "/users/:id", element: <UserDetails /> }],
          },
          {
            element: <ProtectedRoute permission="view_role" />,
            children: [{ path: "/roles", element: <RolesPage /> }],
          },
        ],
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);
