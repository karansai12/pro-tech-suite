import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Project {
  projectId: string;
  projectTitle: string;
}

interface FormData {
  projectId: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
}

interface LoaderData {
  projects: Project[];
}

export const Loader = async () => {
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

const NewTask = () => {
  const { projects } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { handleSubmit, register, setValue } = useForm<FormData>({});
  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/task/createTask",
        data,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success("Task created successfully!", { position: "top-center" });
        navigate("/tasks");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message, { position: "top-center" });
      } else if (error instanceof Error) {
        toast.error(error.message, { position: "top-center" });
      } else {
        toast.error("An unexpected error occurred", { position: "top-center" });
      }
    }
  };
  const taskTitle = register("taskTitle", {
    required: "this field is requird",
    onChange: (e) => {
      setValue("taskTitle", e.target.value);
    },
  });
  const taskDescription = register("taskDescription", {
    required: "this field is required",
    onChange: (e) => {
      setValue("taskDescription", e.target.value);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-125"
      >
        <Select onValueChange={(value) => setValue("projectId", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((item) => {
              return (
                <SelectItem value={item.projectId}>
                  {item.projectTitle}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Input placeholder="task title" {...taskTitle} />
        <Input placeholder="task description" {...taskDescription} />
        <Select onValueChange={(value) => setValue("priority", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
          </SelectContent>
        </Select>

        <Button size="lg">CREATE TASK</Button>
      </form>
    </div>
  );
};

export default NewTask;
