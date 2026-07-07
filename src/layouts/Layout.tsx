import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/ui/AppSidebar";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#09090d] text-white">
      <AppSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
