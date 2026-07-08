import { Helmet } from "react-helmet-async";
import { ProductDetailsComponent } from "@/components/productDetails/ProductDetailsComponent";

const ProductDetails = () => (
  <>
    <Helmet>
      <title>Product Details | ERP System</title>
      <meta name="description" content="View full product details including pricing, stock level, category and profit margin." />
    </Helmet>
    <ProductDetailsComponent />
  </>
);

export default ProductDetails;
