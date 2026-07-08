import { Helmet } from "react-helmet-async";
import { UsersComponent } from "@/components/users/UsersComponent";

export default function UsersPage() {
  return (
    <>
      <Helmet>
        <title>Users | ERP System</title>
        <meta name="description" content="Manage system users — create, update, delete and search user accounts with role assignments." />
      </Helmet>
      <UsersComponent />
    </>
  );
}
