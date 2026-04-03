import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

import ErrorPage from "./pages/errorpage";
import Register from "./pages/register";
import Home from "./pages/home";
import Login from "./pages/login";
import { Toaster } from "@/components/ui/sonner";
import MainLayout from "./components/main-layout";
import Projects, { projectLoader } from "./pages/projects";

import Employees, { employeeLoader } from "./pages/employees";
import ProjectProposals, { proposalLoader } from "./pages/projectProposals";
import Tasks, { taskLoader } from "./pages/tasks";
import NewProposal from "./pages/newProposal";
import NewTask from "./pages/newTask";
import EditTask, { editTaskLoader } from "./pages/editTask";
import EditProposal, { editproposalLoader } from "./pages/editProposal";



// children:[
//   {path:"/register",elemet:<Register/>},
//   {path:"/login",elemet:<Login/>},
// ]

function App() {
  const routes = [
    {
      path: "/login",
      element: <Login />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/register",
      element: <Register />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/",
      element: <MainLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "home",
          element: <Home />,
          errorElement: <ErrorPage />,
        },
        {
          path: "projects",
          element: <Projects />,
          errorElement: <ErrorPage />,
          loader: projectLoader,
        },
        {
          path: "employees",
          element: <Employees />,
          errorElement: <ErrorPage />,
          loader: employeeLoader,
        },
        {
          path: "proposals",
          element: < Outlet/>,
          errorElement: <ErrorPage />,
        
          children:[
            {
          path: "",
          element: <ProjectProposals />,
          errorElement: <ErrorPage />,
            loader: proposalLoader,
        },
         {
          path: "new-proposal",
          element: <NewProposal />,
          errorElement: <ErrorPage />,
        },
         {
          path: "edit/:id",
          element: <EditProposal />,
          errorElement: <ErrorPage />,
          loader: editproposalLoader
        },
          ]

        },
        
        {
          path: "tasks",
          element: <Outlet />,
          errorElement: <ErrorPage />,

          children: [
            {
              path: "",
              element: <Tasks />,
              loader: taskLoader,
              errorElement: <ErrorPage />,
            },
            {
              path: "edit/:id",
              element: <EditTask />,
              errorElement: <ErrorPage />,
              loader: editTaskLoader,
            },
            {
              path: "add",
              element: <NewTask />,
              errorElement: <ErrorPage />,
            },
            {
              path: "delete",
              element: <NewTask />,
              errorElement: <ErrorPage />,
            },
          ],
        },
      ],
    },
  ];
  const router = createBrowserRouter(routes);
  return (
    <div>
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
