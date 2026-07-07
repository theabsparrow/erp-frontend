import LoginComponent from "@/components/login/LoginComponent";
import { Toaster } from "sonner";

export default function LoginPage() {
  return (
    <section className="min-h-screen bg-[#09090d] flex items-center justify-center px-4">
      <Toaster richColors position="top-center" />
      <LoginComponent />
    </section>
  );
}
