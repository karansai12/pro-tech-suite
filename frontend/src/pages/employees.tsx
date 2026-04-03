import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Employee {
  username: string;
  email: string;
  mobileNumber: string;
}

interface LoaderData {
  employees: Employee[];
}

export const employeeLoader = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/user/getAllEmployees",
      {
        withCredentials: true,
      },
    );

    return { employees: response.data.employees };
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

const Employees = () => {
  const { employees } = useLoaderData<LoaderData>();
  return (
    <div>
      {" "}
      <Table>
        <TableCaption>Employee's list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Mobile Number</TableHead>
          </TableRow>
        </TableHeader>
        {employees.map((item) => {
          return (
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{item.username}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell className="text-right">
                  {item.mobileNumber}
                </TableCell>
              </TableRow>
            </TableBody>
          );
        })}
      </Table>
    </div>
  );
};

export default Employees;
