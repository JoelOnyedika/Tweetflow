import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "@/components/hero/Landing";
import CreateVideo from "@/components/createvideo/CreateVideo";
import CreateVoice from "@/components/createvoice/CreateVoice";
import ScheduledVideo from "@/components/scheduledvideo/ScheduledVideo";
import Templates from "@/components/templates/Templates";
import Integrations from "@/components/integrations/Integrations";
import AutoPilot from "@/components/autopilot/AutoPilot";
import VideoLibrary from "@/components/videolibrary/VideoLibrary";
import Settings from "@/components/settings/Settings";
import TemplateCreator from "@/components/templates/ui/TemplateCreator";
import Signup from "@/components/auth/Signup";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:id/createvideo" element={<CreateVideo />} />
        <Route path="/:id/createvoice" element={<CreateVoice />} />
        <Route path="/:id/scheduledvideo" element={<ScheduledVideo />} />
        <Route path="/:id/videolibrary" element={<VideoLibrary />} />
        <Route path="/:id/templates" element={<Templates />} />
        <Route path="/:id/integrations" element={<Integrations />} />
        <Route path="/:id/autopilot" element={<AutoPilot />} />
        <Route path="/:id/settings" element={<Settings />} />
        <Route path="/templatecreator" element={<TemplateCreator />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;