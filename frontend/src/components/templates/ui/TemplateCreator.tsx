import React, { useState,  useEffect } from "react";
import { Link } from "react-router-dom";
import { VideoIcon } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import TemplateEdit from "./TemplateEdit";
import TemplatePreview from "./TemplatePreview";
import { useParams } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import { useToast } from "@/components/customs/Toast";
import { confirmLoggedInUser } from '@/lib/funcs'


// Constants for TikTok video dimensions
export const TIKTOK_WIDTH = 1080;
export const TIKTOK_HEIGHT = 1920;
export const CENTER_Y = TIKTOK_HEIGHT / 2;

export default function TemplateCreator() {
  const {id} = useParams()
  const { showToast, ToastContainer } = useToast();
  const [templateSettings, setTemplateSettings] = useState({
    media: null,
    userId: id,
    text: "Please Modify and Change my Style",
    fontFamily: "Arial",
    isGenerated: false,
    fontSize: 30,
    lineHeight: 3,
    textColor: "#ffffff",
    textOutline: "#000000",
    marginTop: CENTER_Y,
    marginLeft: 270,
    marginRight: 0,
    textAnim: "None",
    templateName: "My Template",
    backgroundColor: "#000000",
  });



  useEffect(() => {
    confirmLoggedInUser(id)
  }, [])

  const handleSettingChange = (setting, value) => {
    setTemplateSettings({ ...templateSettings, [setting]: value });
  };

  const saveTemplate = async () => {
    try {
      const csrftoken = localStorage.getItem('csrfToken');
      console.log(csrftoken)
        const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/upload-templates/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(templateSettings),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.error) {
            showToast(data.error, "error");
        } else {
            showToast("Template saved successfully", "success");
            window.location.href = `/${id}/templates`
        }
    } catch (error) {
        console.error('Error:', error);
        showToast("Error: Something went wrong while saving template", 'error');
    }
};

  return (
    <div className="flex min-h-screen w-full bg-background">
    <ToastContainer />
      <aside className="flex h-full w-14 flex-col border-r sm:w-60">
        <div className="flex h-14 items-center justify-center border-b px-4 sm:justify-start">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <VideoIcon className="h-6 w-6" />
            <span className="hidden sm:inline">TweetFlow</span>
          </Link>
        </div>
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashNavbar />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <h1 className="text-3xl font-bold mb-6">Template Creator</h1>
          <div className="flex flex-col lg:flex-row gap-6">
            <TemplateEdit
              templateSettings={templateSettings}
              handleSettingChange={handleSettingChange}
              saveTemplate={saveTemplate}
              className="w-full lg:w-1/2"
            />
            <TemplatePreview
              templateSettings={templateSettings}
              className="w-full lg:w-1/2"
            />
          </div>
        </main>
      </div>
    </div>
  );
}