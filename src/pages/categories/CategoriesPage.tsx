import { Helmet } from "react-helmet-async";
import { CategoriesComponent } from "@/components/categories/CategoriesComponent";

export default function CategoriesPage() {
  return (
    <>
      <Helmet>
        <title>Categories | ERP System</title>
        <meta name="description" content="Manage product categories — create, update and delete categories used across the product module." />
      </Helmet>
      <CategoriesComponent />
    </>
  );
}
