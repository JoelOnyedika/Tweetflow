import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "@/components/hero/Landing";
import CreateVideo from "@/components/createvideo/CreateVideo";
import CreateVoice from "@/components/createvoice/CreateVoice";
import ScheduledVideo from "@/components/scheduledvideo/ScheduledVideo";
import Templates from "@/components/templates/Templates";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/createvideo" element={<CreateVideo />} />
        <Route path="/createvoice" element={<CreateVoice />} />
        <Route path="/scheduledvideo" element={<ScheduledVideo />} />
        <Route path="/templates" element={<Templates />} />
      </Routes>
    </Router>
  );
}

export default App;