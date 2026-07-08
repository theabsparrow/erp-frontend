import { Helmet } from "react-helmet-async";
import { ProductsComponent } from "@/components/products/ProductsComponent";

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Products | ERP System</title>
        <meta name="description" content="Manage your product inventory — create, update, delete and filter products by category." />
      </Helmet>
      <ProductsComponent />
    </>
  );
}
