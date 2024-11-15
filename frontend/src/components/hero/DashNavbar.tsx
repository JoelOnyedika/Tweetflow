import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Bolt } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getCookie, getCsrfToken } from "@/lib/funcs";
import { useToast } from "../customs/Toast";
import { useNavigate } from "react-router-dom";

const DashNavbar = () => {
  const { showToast, ToastContainer } = useToast();
  const [credits, setCredits] = useState("NaN");

  const navigate = useNavigate();

  const fetchCredits = async (userId) => {
    const csrfToken = await getCsrfToken();
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/credits/${userId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.log("Something is wrong with cookies");
      showToast(
        "Something went wrong while getting your credits. Please refresh",
        "error"
      );
      return navigate("/login");
    }
    const { data, error } = await response.json();
    if (error) {
      showToast(error);
    } else {
      setCredits(data[0].credits);
    }
  };
  useEffect(() => {
    const userId = getCookie("user_id");
    fetchCredits(userId);
  }, []);
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <ToastContainer />
      <h1 className="text-lg font-semibold md:flex hidden">Create Video</h1>
      <div className="md:hidden flex">
        <span className="text-md font-semibold flex">
          <Bolt className="w-6 h-6 mr-2" />
          Credits: {credits}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="md:flex hidden">
          <span className="text-md font-semibold flex">
            <Bolt className="w-6 h-6 mr-2" />
            Credits: {credits}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarFallback>
                <UserCircle className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashNavbar;
