import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";


enum Role {
  manager = "manager",
  employee = "employee",
}

interface FormData {
  username: string;
  password: string;
  email: string;
  role: Role;
  mobileNumber: number;
  profileImage:string
}

const Register = () => {
  const navigate = useNavigate()
  const { handleSubmit, register, setValue } = useForm<FormData>({});
  const onSubmit = async (data: FormData) => {
    try{
       const response = await axios.post(
      "http://localhost:5000/api/user/register",
      {...data,profileImage:"hh"},
    );
    if(response.data.success){
       toast.success("Register successful", { position: "top-center" })
      navigate("/home")
    }
    }catch(error: unknown){
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
  const email = register("email", {
    required: "this field is required",
    onChange: (e) => {
      setValue("email", e.target.value);
    },
  });
  const mobileNumber = register("mobileNumber", {
    required: "this field required",
    onChange: (e) => {
      setValue("mobileNumber", e.target.value);
    },
  });
  const password = register("password", {
    required: "this field is required",
    onChange: (e) => {
      setValue("password", e.target.value);
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}
  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        className="flex flex-col gap-4 w-125"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input placeholder="username" {...username} />
        <Input placeholder="email" {...email} />
        <Select
          onValueChange={(value) => {
            setValue("role", value as Role);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Role"  />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input placeholder="mobilenumber" {...mobileNumber} />
        <Input placeholder="password" {...password} />
         <Input placeholder="profile image" type="file"  onChange={async (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const base64 = await convertToBase64(file)
            setValue("profileImage", base64)
        }
    }}/>
        <Button size="lg"
          
        >REGISTER</Button>
      </form>
    </div>
  );
};

export default Register;