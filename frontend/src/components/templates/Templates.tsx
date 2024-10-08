import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { VideoIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/customs/Toast";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCsrfToken } from "@/lib/funcs";
import { creditSystem } from "@/lib/constants";

const formSchema = z.object({
  voiceName: z.string().min(2, {
    message: "Voice name must be at least 2 characters.",
  }),
  voiceFile: z.instanceof(File).refine((file) => file.size <= 5000000, {
    message: "Voice file must be less than 5MB.",
  }),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

export default function Templates() {
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const [templateData, setTemplateData] = useState(null);

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceName: "",
      voiceFile: null,
      agreeTerms: false,
    },
  });

  function onSubmit(values) {
    console.log(values);
  }

  const getUserTemplates = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-templates/${id}/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        showToast(
          "Whoops something went wrong while fetching your templates",
          "error"
        );
      }
      if (response.status === 401) {
        console.log("User not authenticated, redirecting to login...");
        navigate("/login");
      }
      const data = await response.json();
      if (data.error) {
        showToast(data.error.message, "error");
      }
      console.log(data);
      setTemplateData(data.data);
    } catch (error) {
      console.log(error);
      showToast(
        "Whoops something went wrong while fetching your templates",
        "error"
      );
    }
  };

  const hexToRgb = (hex) => {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const csrftoken = await getCsrfToken();
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_SERVER_URL
        }/api/delete-template/${templateId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.error) {
        showToast(data.error, "error");
      } else {
        showToast("Template deleted successfully", "success");
        setTemplateData(templateData?.filter(obj => obj.id !== templateId))
      }
    } catch (error) {
      showToast("Something went wrong while deleting your template.", "error");
    }
  };

  useEffect(() => {
    // confirmLoggedInUser(id)
    getUserTemplates();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ToastContainer />
      <aside className="flex h-full w-14 flex-col border-r sm:w-60">
        <div className="flex h-14 items-center justify-center border-b px-4 sm:justify-start">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <VideoIcon className="h-6 w-6" />
            <span className="hidden sm:inline">Video Creator</span>
          </Link>
        </div>
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashNavbar />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="inline-flex justify-between items-center w-full">
            <h1 className="text-3xl font-bold mb-6">Templates</h1>
            <Link to={`templatecreator`}>
              <Button>
                <Plus />{" "}
                <span className="hidden md:flex font-semibold">Create Template</span>
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templateData ? (
              templateData === [] ? (
                "You have no templates. Go create one"
              ) : (
                templateData.map((data) => (
                  <Card className="w-full max-w-sm mx-auto" key={data.id}>
                    <CardHeader className="flex justify-between items-center pb-2">
                      <CardTitle className="text-sm font-medium">
                        {data.template_name}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/${id}/templates/${data.id}`)
                          }
                          className="rounded-md p-2 bg-slate-200 text-primary hover:bg-slate-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                            <button className="rounded-md p-2 bg-slate-200 text-red-600 hover:bg-red-100" onClick={() => handleDeleteTemplate(data.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                      </div>
                    </CardHeader>

                    <CardContent
                      className="aspect-[9/16] rounded-md overflow-hidden"
                      style={{
                        backgroundColor:
                          data.media === null &&
                          `rgb(${hexToRgb(data.background_color)})`,
                      }}
                    >
                      {data.media !== "None" && (
                        <img src={data.media} alt="Media content" />
                      )}
                    </CardContent>
                  </Card>
                ))
              )
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
