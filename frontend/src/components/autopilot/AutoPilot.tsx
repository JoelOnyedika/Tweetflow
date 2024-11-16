import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useParams } from "react-router-dom";
import { VideoIcon, Loader2 } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { useToast } from "@/components/customs/Toast";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { UPLOAD_INTERVALS, UPLOAD_PLATFORMS } from "@/lib/constants";
import { getCsrfToken } from "@/lib/funcs";

const Autopilot = () => {
  const { showToast, ToastContainer } = useToast();
  const [settingsData, setSettingsData] = useState(null);
  const [formData, setFormData] = useState({
    platform: "",
    interval: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUserSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-user-settings/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const { data, error } = await response.json();
      if (error) {
        showToast(error.message, "error");
      } else {
        setSettingsData(data[0]);
        setFormData({
          platform: data[0].platform,
          interval: data[0].interval,
        });
      }
    } catch (error) {
      console.log(error);
      showToast(
        "Something went wrong while loading your settings. Please Refresh.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const csrftoken = await getCsrfToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/save-user-settings/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(formData),
        }
      );

      const { error } = await response.json();

      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Settings updated successfully!", "success");
      }
    } catch (error) {
      showToast("Failed to update settings. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.platform && formData.interval;

  return (
    <div className="flex min-h-screen w-full bg-background">
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
          <ToastContainer />
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
              Autopilot Settings
            </h1>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Configure Your Auto-Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Upload Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, platform: value }))
                        }
                      >
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {UPLOAD_PLATFORMS.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interval">Upload Interval</Label>
                      <Select
                        value={formData.interval}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, interval: value }))
                        }
                      >
                        <SelectTrigger id="interval">
                          <SelectValue placeholder="Select an interval" />
                        </SelectTrigger>
                        <SelectContent>
                          {UPLOAD_INTERVALS.map((interval) => (
                            <SelectItem key={interval.id} value={interval.id}>
                              {interval.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!isFormValid || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Autopilot;
