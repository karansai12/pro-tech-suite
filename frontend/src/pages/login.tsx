import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
interface FormData {
  username: string;
  password: string;
}
const Login = () => {
  const navigate = useNavigate();

  const { handleSubmit, register, setValue } = useForm<FormData>({});
  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/login",
        data,
        {withCredentials:true}
      );
        console.log({response})
      if (response.data.success) {
        localStorage.setItem("user",JSON.stringify(response.data.user))
        toast.success("Login successful", { position: "top-center" });
        navigate("/home");
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
  const username = register("username", {
    required: "this field is requird",
    onChange: (e) => {
      setValue("username", e.target.value);
    },
  });
  const password = register("password", {
    required: "this field is required",
    onChange: (e) => {
      setValue("password", e.target.value);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-125"
      >
        <Input placeholder="username" {...username} />
        <Input placeholder="password" {...password} />
        <Button size="lg">LOGIN</Button>
      </form>
    </div>
  );
};

export default Login;