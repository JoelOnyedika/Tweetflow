import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VideoIcon } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import TemplateEdit from "./TemplateEdit";
import TemplatePreview from "./TemplatePreview";

export default function TemplateCreator() {
  const [templateSettings, setTemplateSettings] = useState({
    image: null,
    text: "Your tweet text here",
    fontFamily: "Arial",
    fontSize: 30,
    lineHeight: 1.5,
    textColor: "#ff0000",
    textColorUnread: "#888888",
    textOutline: "#ffffff",
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    textAnim: "Typewriter",
  });

  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const handleSettingChange = (setting, value) => {
    setTemplateSettings({ ...templateSettings, [setting]: value });
  };

  const saveTemplate = () => {
    // Implement save functionality (e.g., to localStorage or backend)
    console.log("Saving template:", templateSettings);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
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
              dragPosition={dragPosition}
              setDragPosition={setDragPosition}
              className="w-full lg:w-1/2"
            />
          </div>
        </main>
      </div>
    </div>
  );
}