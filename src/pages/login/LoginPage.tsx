import { Helmet } from "react-helmet-async";
import LoginComponent from "@/components/login/LoginComponent";
import { Toaster } from "sonner";

export default function LoginPage() {
  return (
    <section className="min-h-screen bg-[#09090d] flex items-center justify-center px-4">
      <Helmet>
        <title>Login | ERP System</title>
        <meta name="description" content="Sign in to your ERP account to manage products, sales, users and more." />
      </Helmet>
      <Toaster richColors position="top-center" />
      <LoginComponent />
    </section>
  );
}
