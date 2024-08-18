import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VideoIcon, Search, Trash2, Clock, Calendar } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Mock data for videos
const mockVideos = [
  { id: 1, title: "Funny Cat Video", status: "uploaded", uploadDate: "2024-08-15" },
  { id: 2, title: "Cooking Tutorial", status: "pending", uploadDate: "2024-08-16" },
  { id: 3, title: "Travel Vlog", status: "uploaded", uploadDate: "2024-08-17" },
  { id: 4, title: "Tech Review", status: "failed", uploadDate: "2024-08-18" },
  // Add more mock videos as needed
];

export default function VideoLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isChangeTimeDialogOpen, setIsChangeTimeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");

  const filteredVideos = mockVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || video.status === statusFilter)
  );

  const handleDelete = (video) => {
    // Implement delete logic here
    console.log(`Deleting video: ${video.title}`);
    setIsDeleteDialogOpen(false);
  };

  const handleChangeUploadTime = () => {
    const newDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    // Implement change upload time logic here
    console.log(`Changing upload time for ${selectedVideo.title} to ${newDateTime.toISOString()}`);
    setIsChangeTimeDialogOpen(false);
  };

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
          <h1 className="text-3xl font-bold mb-6">Video Library</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-200 mb-2 rounded"></div>
                  <h3 className="font-semibold mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Upload date: {video.uploadDate}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${
                      video.status === 'uploaded' ? 'text-green-600' :
                      video.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedVideo(video);
                        setIsChangeTimeDialogOpen(true);
                      }}>
                        <Clock className="h-4 w-4 mr-2" /> Change Time
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedVideo(video);
                        setIsDeleteDialogOpen(true);
                      }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No videos found.</p>
          )}
        </main>
      </div>

      {/* Change Upload Time Dialog */}
      <Dialog open={isChangeTimeDialogOpen} onOpenChange={setIsChangeTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Upload Time</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Date:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Time:</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeTimeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeUploadTime}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedVideo)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
