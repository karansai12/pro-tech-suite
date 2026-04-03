import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontalIcon } from "lucide-react";

import {
  Link,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "react-router-dom";
import { toast } from "sonner";

interface Proposal {
  proposalId: string;
  proposalTitle: string;
  proposalDescription: string;
  status: string;
}

interface LoaderData {
  projectProposals: Proposal[];
}

export const proposalLoader = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/proposal/getAllProposals",
      {
        withCredentials: true,
      },
    );
    return { projectProposals: response.data.proposals };
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

const ProjectProposals = () => {
  const revalidator = useRevalidator();
  const { projectProposals } = useLoaderData<LoaderData>();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = user.role === "manager";

  const navigate = useNavigate();
  const onclickApprove = async (proposal: Proposal) => {
    try {
      await axios.put(
        `http://localhost:5000/api/proposal/updateProposal/${proposal.proposalId}`,
        {
          proposalId: proposal.proposalId,
          proposalTitle: proposal.proposalTitle,
          proposalDescription: proposal.proposalDescription,
          status: "approve",
        },
        {
          withCredentials: true,
        },
      );
      revalidator.revalidate();
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
  const onclickReject = async (proposal: Proposal) => {
    try {
      await axios.put(
        `http://localhost:5000/api/proposal/updateProposal/${proposal.proposalId}`,
        {
          proposalId: proposal.proposalId,
          proposalTitle: proposal.proposalTitle,
          proposalDescription: proposal.proposalDescription,
          status: "Rejected",
        },
        {
          withCredentials: true,
        },
      );
      revalidator.revalidate();
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
  const onClickDelete = async (proposalId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/proposal/deleteProposal/${proposalId}`,
        { withCredentials: true },
      );
      toast.success("Task deleted successfully", { position: "top-center" });
      revalidator.revalidate();
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

  return (
    <div>
      {!isManager ? (
        <Button asChild>
          <Link to="new-proposal">Create New Proposal</Link>
        </Button>
      ) : null}

      <Table>
        <TableCaption>Project Proposal list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal Title</TableHead>
            <TableHead>Proposal Description</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectProposals.map((item) => (
            <TableRow key={item.proposalTitle}>
              <TableCell className="font-medium">
                {item.proposalTitle}
              </TableCell>
              <TableCell>{item.proposalDescription}</TableCell>
              <TableCell className="text-right">{item.status}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!isManager ? (
                      <DropdownMenuItem
                        onClick={() => {
                          navigate(`/proposals/edit/${item.proposalId}`);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    ) : null}

                    {isManager ? (
                      <DropdownMenuItem
                        onClick={() => {
                          onclickApprove(item);
                        }}
                      >
                        Approve
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    {isManager ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          onclickReject(item);
                        }}
                      >
                        Reject
                      </DropdownMenuItem>
                    ) : null}
                    {!isManager ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onClickDelete(item.proposalId)}
                      >
                        Delete
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectProposals;
