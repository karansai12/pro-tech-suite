import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLoaderData,
  useNavigate,
  type LoaderFunction,
} from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface FormData {
  proposalId: string;
  proposalTitle: string;
  proposalDescription: string;
}
interface Proposal {
  proposalId: string;
  taskId: string;
  proposalTitle: string;
  proposalDescription: string;
}
interface LoaderData {
  proposal: Proposal;
}

export const editproposalLoader: LoaderFunction = async ({ params }) => {
  const id = params.id as string;
  try {
    const response = await axios.get(
      `http://localhost:5000/api/proposal/getProposalById/${id}`,
      {
        withCredentials: true,
      },
    );
    console.log({ response });
    return { proposal: response.data };
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

const EditProposal = () => {
  const navigate = useNavigate();
  const { proposal } = useLoaderData<LoaderData>();
  const { handleSubmit, register, setValue } = useForm<FormData>({
    defaultValues: {
      proposalId: proposal.proposalId,
      proposalTitle: proposal.proposalTitle,
      proposalDescription: proposal.proposalDescription,
    },
  });
  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/proposal/updateProposal/${proposal.proposalId}`,
        data,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success("Proposal updated successfully!", {
          position: "top-center",
        });
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
      <form
        className="flex flex-col gap-4 w-125"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input placeholder="task title" {...proposalTitle} />
        <Input placeholder="task description" {...proposalDescription} />
        <Button size="lg">Update Proposal</Button>
      </form>
    </div>
  );
};

export default EditProposal;
