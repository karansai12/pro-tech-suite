
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";

interface FormData {
  proposalTitle: string;
  proposalDescription: string;
}

const NewProposal = () => {
   const navigate = useNavigate();
    const { handleSubmit,register,setValue } = useForm<FormData>({});
   const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/proposal/createProposal",
        data,
        {withCredentials:true}
      );
      if (response.data.success) {
        toast.success("Login successful", { position: "top-center" });
        navigate("/proposals");
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
   const proposalTitle = register("proposalTitle", {
    required: "this field is requird",
    onChange: (e) => {
      setValue("proposalTitle", e.target.value);
    },
  });
  const proposalDescription = register("proposalDescription", {
    required: "this field is required",
    onChange: (e) => {
      setValue("proposalDescription", e.target.value);
    },
  });
  return (
    <div className="flex items-center justify-center min-h-screen">
        <form  onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-125">
            <Input placeholder="proposal title" {...proposalTitle}/>
            <Input placeholder="proposal description" {...proposalDescription} />
        <Button size="lg">CREATE PROPOSAL</Button>
        </form>
      
    </div>
  )
}

export default NewProposal
