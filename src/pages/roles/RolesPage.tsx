import { Helmet } from "react-helmet-async";
import { RolesComponent } from "@/components/roles/RolesComponent";

export default function RolesPage() {
  return (
    <>
      <Helmet>
        <title>Roles | ERP System</title>
        <meta name="description" content="Manage roles and assign granular permissions to control access across the system." />
      </Helmet>
      <RolesComponent />
    </>
  );
}
