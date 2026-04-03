import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { toast } from "sonner";

interface Project {
  projectTitle: string;
  projectDescription: string;
}
interface LoaderData {
  projects: Project[];
}

export const projectLoader = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/project/getAllProjects",
      {
        withCredentials: true,
      },
    );
    return { projects: response.data.projects };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message, { position: "top-center" });
    } else if (error instanceof Error) {
      toast.error(error.message, { position: "top-center" });
    } else {
      toast.error("An unexpected error occurred", { position: "top-center" });
    }
  }
};


const Projects = () => {
   const { projects } = useLoaderData<LoaderData>()
  return (
    <div>
      <Table>
      <TableCaption>Project list</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Project Title</TableHead>
          <TableHead>Project Description</TableHead>
         
        </TableRow>
      </TableHeader>
      {projects.map((item) => {
        return (
          
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{item.projectTitle}</TableCell>
                <TableCell>{item.projectDescription}</TableCell>
              </TableRow>
            </TableBody>
         
        );
      })} </Table>
    </div>
  );
};

export default Projects;
