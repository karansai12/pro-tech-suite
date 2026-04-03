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
import { toast } from "sonner";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

enum Prioprity {
  High = "high",
  Medium = "medium",
  Low = "Low"
}

enum Status {
  Open = "open",
  Inprogress = "in-progress"
}

interface Task {
  taskId:string;
  taskTitle: string;
  taskDescription: string;
  assignedTo: string;
  status: Status;
  priority: Prioprity;
}
interface LoaderData {
  tasks: Task[];
}

export const taskLoader = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/task/getAllTask",
      {
        withCredentials: true,
      },
    );
    console.log({response})
    return { tasks: response.data.tasks };
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

const Tasks = () => {
  const navigate = useNavigate()
   const revalidator = useRevalidator();
  const { tasks } = useLoaderData<LoaderData>();
    console.log({tasks})
  const user = JSON.parse(localStorage.getItem("user")|| "{}")
  console.log({user})
  const isManager = user.role ===  "manager" 
  const onClickDelete = async (taskId: string) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/task/deleteTask/${taskId}`,
      { withCredentials: true }
    )
    toast.success("Task deleted successfully", { position: "top-center" })
    revalidator.revalidate()
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message, { position: "top-center" })
    } else if (error instanceof Error) {
      toast.error(error.message, { position: "top-center" })
    } else {
      toast.error("An unexpected error occurred", { position: "top-center" })
    }
  }
}

  return (
    <div>
       <Button asChild><Link to="/tasks/add">Create New Task</Link></Button>
      <Table>
      <TableCaption>Task list</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Task Title</TableHead>
          <TableHead>Task Description</TableHead>
          <TableHead className="text-right">Status</TableHead>
          <TableHead>Task Priority</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      {tasks.map((item) => {
        return (
          
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{item.taskTitle}</TableCell>
                <TableCell>{item.taskDescription}</TableCell>
                <TableCell className="text-right">{item.status}</TableCell>
                <TableCell>{item.priority}
                </TableCell>
                <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontalIcon />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={()=>{navigate(`/tasks/edit/${item.taskId}`)}} >
                                   Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {isManager ?( <DropdownMenuItem variant="destructive"  onClick={() => onClickDelete(item.taskId)} >
                                    Delete
                                </DropdownMenuItem>):null}
                               
                            </DropdownMenuContent>
                        </DropdownMenu>
              </TableRow>
            </TableBody>
          
        );
      })}</Table>
    </div>
  );
};

export default Tasks;
