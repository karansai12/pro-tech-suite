import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const SideNavigation = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div>
      <Sidebar>
        <SidebarHeader>PRO-TECH-SUIT</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenuButton asChild>
              <Link to="/projects">Projects</Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Link to="/proposals">Project Proposal</Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Link to="/tasks">Task</Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Link to="/employees">Employees</Link>
            </SidebarMenuButton>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>{user.role} </SidebarFooter>
        <SidebarFooter>{user.username} </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default SideNavigation;
