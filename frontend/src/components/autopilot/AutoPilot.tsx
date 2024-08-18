import React from "react";
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
import { Switch } from "@/components/ui/switch";
import { UPLOAD_PLATFORMS, UPLOAD_INTERVALS } from "@/lib/constants";
import { Link } from "react-router-dom";
import { VideoIcon } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";

const Autopilot = () => {
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
          <div>
            <h1 className="text-n3xl font-semibold text-gray-800 mb-6">
              Autopilot Upload Settings
            </h1>
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Configure Your Auto-Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platform">Upload Platform</Label>
                  <Select>
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
                  <Select>
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

                <div className="flex items-center space-x-2">
                  <Switch id="auto-upload" />
                  <Label htmlFor="auto-upload">Auto-upload</Label>
                </div>

                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Autopilot;
