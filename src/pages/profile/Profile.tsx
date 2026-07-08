import { Helmet } from "react-helmet-async";
import ProfileComponent from "@/components/profile/ProfileComponent";

export default function Profile() {
  return (
    <section className="min-h-screen bg-[#09090d] flex items-center justify-center px-4">
      <Helmet>
        <title>Profile | ERP System</title>
        <meta name="description" content="View and update your personal profile and account settings." />
      </Helmet>
      <ProfileComponent />
    </section>
  );
}
