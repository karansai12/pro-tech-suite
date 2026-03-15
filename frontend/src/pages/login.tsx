import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form"
import axios from "axios"
interface FormData {
  username: string;
  password:string
}
const Login = () => {
  const {handleSubmit,register,setValue}= useForm<FormData>({})
  const onSubmit=async(data:FormData)=>{
    const response = await axios.post("http://localhost:5000/api/user/login",data)
    console.log({response})
    
  }
  const username = register("username",{
    required:"this field is requird",
    onChange:(e)=>{
      setValue("username",e.target.value)
    }
  })
  const password = register("password",{
    required:"this field is required",
    onChange:(e)=>{
      setValue("password",e.target.value)
    }
  })
  
  return (
    <div className="flex items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-125"  >
      <Input placeholder="username" {...username} />
      <Input placeholder="password" {...password}/>
      <Button size="lg">LOGIN</Button>
    </form>
    </div>
    
  );
};

export default Login;
