import { Helmet } from "react-helmet-async";
import { SalesComponent } from "@/components/sales/SalesComponent";

export default function SalesPage() {
  return (
    <>
      <Helmet>
        <title>Sales | ERP System</title>
        <meta name="description" content="Record new sales transactions and browse the full sales history with item breakdowns." />
      </Helmet>
      <SalesComponent />
    </>
  );
}
