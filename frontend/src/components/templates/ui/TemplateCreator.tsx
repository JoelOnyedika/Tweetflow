import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VideoIcon } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import TemplateEdit from "./TemplateEdit";
import TemplatePreview from "./TemplatePreview";
import { useParams } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { useToast } from "@/components/customs/Toast";
import { chopUserCredits, getCsrfToken } from '@/lib/funcs';
import { creditSystem } from "@/lib/constants";

// Constants for TikTok video dimensions
export const TIKTOK_WIDTH = 1080;
export const TIKTOK_HEIGHT = 1920;
export const CENTER_Y = TIKTOK_HEIGHT / 2;

export default function TemplateCreator() {
  const { id: userParamId } = useParams();
  const { templateId } = useParams();
  const { showToast, ToastContainer } = useToast();
  const [templateSettings, setTemplateSettings] = useState({
    id: uuidV4(),
    media: null,
    userId: userParamId,
    text: "Please Modify and Change my Style",
    fontFamily: "Arial",
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
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [fetchedTemplateData, setFetchedTemplateData] = useState(null);

  const getUserTemplatesDataById = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-templates-by-id/${templateId}/`, 
        { method: 'GET', credentials: 'include' }
      );

      if (!response.ok) {
        showToast('Whoops something went wrong while fetching your templates', 'error');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        showToast(data.error.message, 'error');
        return;
      }

      setFetchedTemplateData(data.data[0]);
    } catch (error) {
      
      showToast('Whoops something went wrong while fetching your templates', 'error');
    }
  };

  useEffect(() => {
    

    if (templateId) {
      getUserTemplatesDataById();
    }
  }, [templateId]);

  useEffect(() => {
    if (fetchedTemplateData) {

      const templateData = {
        id: fetchedTemplateData.id,
        userId: fetchedTemplateData.user,
        media: fetchedTemplateData.media,
        text: fetchedTemplateData.text,
        fontFamily: fetchedTemplateData.font_family,
        fontSize: fetchedTemplateData.font_size,
        lineHeight: fetchedTemplateData.line_height,
        textColor: fetchedTemplateData.text_color,
        textOutline: fetchedTemplateData.text_outline_color,
        marginTop: fetchedTemplateData.top_margin,
        marginLeft: fetchedTemplateData.left_margin,
        marginRight: fetchedTemplateData.right_margin,
        textAnim: fetchedTemplateData.text_animation,
        templateName: fetchedTemplateData.template_name,
        backgroundColor: fetchedTemplateData.background_color
      };

      setTemplateSettings(templateData);
      
      
    }
  }, [fetchedTemplateData]);

  const handleSettingChange = (setting, value) => {
    setTemplateSettings({ ...templateSettings, [setting]: value });
  };

  const saveTemplate = async () => {
    try {
        setIsSavingTemplate(true)
        const csrftoken = await getCsrfToken();

        // Chop user credits and check for errors
        const { data, error } = await chopUserCredits(userParamId, creditSystem.createTemplate);

        if (error) {
            setIsSavingTemplate(false)
            showToast(error.message, 'error');
        } else if (data) {
            try {
                setIsSavingTemplate(true);
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/upload-templates/`, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken,
                        },
                        body: JSON.stringify(templateSettings),
                        credentials: 'include',
                    }
                );
                

                const responseData = await response.json();
                

                if (responseData.error) {
                    setIsSavingTemplate(false)
                    showToast(responseData.error.message, 'error');

                } else {
                    setIsSavingTemplate(false)
                    showToast("Template saved successfully", 'success');
                    console.log(responseData.data)
                    window.location.href = `/${userParamId}/templates`;
                }
            } catch (error) {
                console.error('Error:', error);
                setIsSavingTemplate(false)
                showToast("Error: Something went wrong while saving template", 'error');
            } finally {
                setIsSavingTemplate(false);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast("Error: Something went wrong while saving template", 'error');
        setIsSavingTemplate(false);
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
              isSavingTemplate={isSavingTemplate}
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
