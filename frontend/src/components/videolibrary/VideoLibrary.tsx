import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  VideoIcon,
  Search,
  Trash2,
  Clock,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/customs/Toast";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { chopUserCredits, getCsrfToken } from "@/lib/funcs";
import { creditSystem } from "@/lib/constants";

export default function VideoLibrary() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedVideos, setFetchedVideos] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isChangeTimeDialogOpen, setIsChangeTimeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [selectedTime, setSelectedTime] = useState();
  const [savingSchedule, setSavingSchedule] = useState(false);
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();

  const fetchAllVideos = async () => {
    try {
      setIsLoading(true);
      if (id === null) {
        return navigate("/login");
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-videos/${id}/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json(); // Ensure we parse the JSON response
      if (!response.ok) {
        showToast(data.error.message || "Failed to fetch videos", "error");
      } else {
        setFetchedVideos(data.data); // Update fetchedVideos state
        setSelectedVideo(data.data); // Set selectedVideo state to the fetched videos

        if (data.data.upload_date) {
          const parsedDate = parse(
            data.data.upload_date,
            "yyyy-MM-dd",
            new Date()
          );
          setSelectedDate(parsedDate);
          console.log("Parsed date:", parsedDate);
        }

        if (data.upload_time) {
          // Get just HH:mm:ss part, assuming input is 24-hour format like "16:51:30.233540"
          const timeWithoutMicros = data.upload_time.split(".")[0];

          // Convert to 12-hour format for display
          const [hours, minutes, seconds] = timeWithoutMicros.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight

          // Format as "HH:mm:ss" with padded zeros
          const formattedTime = `${hour12
            .toString()
            .padStart(2, "0")}:${minutes}:${seconds}`;

          console.log(`Original time: ${data.upload_time}`);
          console.log(`Formatted for input: ${formattedTime}`);
          console.log(`AM/PM: ${ampm}`);

          setSelectedTime(formattedTime);
        }

        setFilteredVideos(
          data.data && Array.isArray(data.data)
            ? data.data.filter(
                (video) =>
                  video.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                  (statusFilter === "all" ||
                    video.upload_status === statusFilter)
              )
            : []
        );
        console.log(filteredVideos);
      }
    } catch (err) {
      console.log(err);
      showToast("Something went wrong while getting your videos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVideos();
    console.log(selectedTime);
  }, []);

  const handleDelete = async (video: any) => {
    try {
      const csrftoken = await getCsrfToken();

      const { data, error } = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/delete-video-by-id/${
          video.id
        }/`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          method: "DELETE",
          credentials: "include",
        }
      );
      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Video has been deleted");
      }
    } catch (error) {
      setIsDeleteDialogOpen(false);
      console.log(error);
      showToast("Something went wrong while getting your videos", "error");
    }
    console.log(`Deleting video: ${video.id}`);
    setIsDeleteDialogOpen(false);
  };

  const extractTitleFromUrl = (url: string) => {
    const parts = url.split("/"); // Split by '/'
    const fileName = parts[parts.length - 1]; // Get the last part
    return fileName; // Return the file name
  };

  const handleDownloadVideo = async (video: string) => {
    try {
      // Deduct credits before downloading
      const { error } = await chopUserCredits(id, creditSystem.downloadVideo);
      if (error) {
        showToast(error.message, "error");
        return;
      }

      // Start downloading the video
      setIsDownloadingVideo(true);
      console.log("Downloading video:", video.video_url);

      // Fetch the video.video_url as a Blob
      const response = await fetch(video.video_url);
      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create an anchor element and trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = extractTitleFromUrl(video.video_url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release memory
      URL.revokeObjectURL(url);

      // Show success toast
      showToast("Video downloaded successfully!", "success");
      setIsDownloadingVideo(false);
    } catch (error: any) {
      setIsDownloadingVideo(false);
      console.error("Error downloading the video:", error);
      showToast(
        "Something went wrong while downloading the video. Please refresh.",
        "error"
      );
    }
  };

  const updateVideoSchedule = async () => {
    try {
      setSavingSchedule(true);
      if (!selectedDate || !selectedTime) {
        showToast("Please select both date and time");
        return;
      }

      const csrftoken = await getCsrfToken();

      // Format the date and time
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const formattedTime = `${selectedTime}.000000`;

      console.log(selectedVideo);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/update-video-schedule/${
          selectedVideo.id
        }/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({
            date: formattedDate,
            time: formattedTime,
          }),
        }
      );

      const { data, error } = await response.json();
      if (error) {
        showToast(error.message, "error");
        setSavingSchedule(false);
      } else {
        showToast("Video has been re-scheduled");
        setSavingSchedule(false);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      showToast("Failed to update your video schedule", "error");
      setSavingSchedule(false);
    }
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
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <ToastContainer />
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
                {filteredVideos.length === 0 ? (
                  <p className="text-center text-gray-500 mt-8">
                    No videos found.
                  </p>
                ) : (
                  filteredVideos.map((video) => (
                    <Card key={video.id}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-200 mb-2 rounded">
                          <video
                            className="w-full h-full rounded"
                            src={video.video_url}
                            controls
                            loading="lazy"
                            controlsList="nodownload"
                          />
                        </div>
                        <h3 className="font-semibold mb-1">{video.title}</h3>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500 mb-2">
                            Upload date: {video.upload_date}
                          </p>
                          <span
                            className={`text-sm font-medium ${
                              video.upload_status === "Uploaded"
                                ? "text-green-600"
                                : video.upload_status === "Pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {video.upload_status.charAt(0).toUpperCase() +
                              video.upload_status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVideo(video);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={video.upload_status === "Uploaded"}
                              onClick={() => {
                                setSelectedVideo(video);
                                setIsChangeTimeDialogOpen(true);
                              }}
                            >
                              <Clock className="h-4 w-4 mr-2" /> Change Time
                            </Button>
                            <Button
                              variant="solid"
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => {
                                setSelectedVideo(video);
                                setIsDownloadDialogOpen(true);
                              }}
                            >
                              {isDownloadingVideo ? (
                                <>
                                  <Loader2 className="animate-spin h-4 w-4 mr-2" />{" "}
                                  Downloading{" "}
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" /> Download{" "}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </main>
            {/* Change Upload Time Dialog */}
            <Dialog
              open={isChangeTimeDialogOpen}
              onOpenChange={setIsChangeTimeDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Upload Time</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Date:
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
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
                    <label className="block text-sm font-medium mb-2">
                      Select Time:
                    </label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      step="1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangeTimeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={updateVideoSchedule}>
                    {savingSchedule ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to delete this video? This action cannot
                  be undone.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedVideo)}
                    >
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Download Confirmation Dialog */}
            <Dialog
              open={isDownloadDialogOpen}
              onOpenChange={setIsDownloadDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Download</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  You want to download this video, This will cost you{" "}
                  <b>{creditSystem.downloadVideo} Credits.</b>
                </DialogDescription>
                <DialogClose>
                  <Button
                    variant="solid"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleDownloadVideo(selectedVideo)}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </DialogClose>
                <Button
                  variant="outline"
                  onClick={() => setIsDownloadDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
