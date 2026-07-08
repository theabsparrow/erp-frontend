import { Helmet } from "react-helmet-async";
import { SalesDetailsComponent } from "@/components/salesDetails/SalesDetailsComponent";

const SalesDetails = () => (
  <>
    <Helmet>
      <title>Sale Details | ERP System</title>
      <meta name="description" content="View full details of a sale transaction including items sold, quantities, totals and the seller." />
    </Helmet>
    <SalesDetailsComponent />
  </>
);

export default SalesDetails;
