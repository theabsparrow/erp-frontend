import { UserDetailsComponent } from "@/components/userDetails/UserDetailsComponent";
import { Helmet } from "react-helmet-async";

const UserDetails = () => (
    <>
    v<Helmet>
        <title> User details | ERP System</title>
        <meta
          name="description"
          content="View full product details including pricing, stock level, category and profit margin."
        />
      </Helmet>
      <UserDetailsComponent />
    </>
);

export default UserDetails;
