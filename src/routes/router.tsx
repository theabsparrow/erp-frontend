import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import Layout from "../layouts/Layout";
import NotFound from "../pages/notFound/NotFound";
import CategoriesPage from "../pages/categories/CategoriesPage";
import ProductsPage from "../pages/products/ProductsPage";
import SalesPage from "../pages/sales/SalesPage";
import UsersPage from "../pages/users/UsersPage";
import RolesPage from "../pages/roles/RolesPage";
import PermissionsPage from "../pages/permissions/PermissionsPage";
import LoginPage from "../pages/login/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/sales",
        element: <SalesPage />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/roles",
        element: <RolesPage />,
      },
      {
        path: "/permissions",
        element: <PermissionsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
