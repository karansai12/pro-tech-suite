import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLoaderData,
  useNavigate,
  type LoaderFunction,
} from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

enum Priority {
  High = "high",
  Medium = "medium",
  Low = "Low",
}

enum Status {
  Open = "open",
  Inprogress = "in-progress",
}

interface FormData {
  projectId: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  status: Status;
}
interface Task {
  projectId: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  assignedTo: string;
  status: Status;
  priority: Priority;
}
interface LoaderData {
  task: Task;
}

export const editTaskLoader: LoaderFunction = async ({ params }) => {
  const id = params.id as string;
  try {
    const response = await axios.get(
      `http://localhost:5000/api/task/getTaskById/${id}`,
      {
        withCredentials: true,
      },
    );
    console.log({ response });
    return { task: response.data };
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

const EditTask = () => {
  const navigate = useNavigate();
  const { task } = useLoaderData<LoaderData>();
  const { handleSubmit, register, setValue, watch } = useForm<FormData>({
    defaultValues: {
      projectId: task.projectId,
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription,
      priority: task.priority,
      status: task.status,
    },
  });
  const [selectedPriority, selectStatus] = watch(["priority", "status"]);
  console.log({ task });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/task/updateTask/${task.taskId}`,
        data,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success("Task updated successfully!", { position: "top-center" });
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
        className="flex flex-col gap-4 w-125"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input placeholder="task title" {...taskTitle} />
        <Input placeholder="task description" {...taskDescription} />

        <Select
          onValueChange={(value) => setValue("priority", value)}
          value={selectedPriority}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setValue("status", value as Status)}
          value={selectStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">open</SelectItem>
            <SelectItem value="in-progress">in-progress</SelectItem>
            <SelectItem value="copleted">copleted</SelectItem>
          </SelectContent>
        </Select>
        <Button size="lg">Update Task</Button>
      </form>
    </div>
  );
};

export default EditTask;
