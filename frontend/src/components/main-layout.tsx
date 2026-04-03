import SidebarNavigation from "./side-navigation";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <SidebarProvider>
        <SidebarNavigation />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
