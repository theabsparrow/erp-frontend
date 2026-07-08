import { Helmet } from "react-helmet-async";
import { HomeComponent } from "@/components/home/HomeComponent";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | ERP System</title>
        <meta name="description" content="Overview of key business metrics — revenue, orders, products, users and low stock alerts." />
      </Helmet>
      <HomeComponent />
    </>
  );
}
