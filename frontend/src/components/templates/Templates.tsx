import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/hero/Sidebar";
import { VideoIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/customs/Toast";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "@/lib/funcs";
import DashNavbar from "@/components/hero/DashNavbar";

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
        setTemplateData(templateData?.filter((obj) => obj.id !== templateId));
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
                <span className="hidden md:flex font-semibold">
                  Create Template
                </span>
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templateData ? (
              templateData === [] ? (
                "You have no templates. Go create one"
              ) : (
                templateData.map((data) => (
                  <div
                    key={data.id}
                    className="relative flex flex-col h-64 w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      {data.media ? (
                        data.media.endsWith(".mp4") ? (
                          <video
                            src={data.media}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={data.media}
                            alt={data.template_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
                      )}
                    </div>

                    <div className="relative h-full p-4 flex flex-col justify-between">
                      <h3 className="text-lg font-semibold text-white stroke-black line-clamp-2">
                        {data.template_name}
                      </h3>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/${id}/templates/${data.id}`)
                          }
                          className="flex-1 rounded-md p-2 bg-slate-200 text-primary hover:bg-slate-300 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(data.id)}
                          className="rounded-md p-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
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
