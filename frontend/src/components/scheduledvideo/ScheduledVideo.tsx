import React, { useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { VideoIcon, Pencil, Trash2 } from "lucide-react";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {useParams, useNavigate} from 'react-router-dom'
import { useToast } from "@/components/customs/Toast";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import * as z from "zod";
import { getCsrfToken } from "@/lib/funcs";


const videoData = {
  youtube: [
    { id: 1, title: "YouTube Video 1", url: "https://example.com/videoy1.mp4", date: "2023-08-01", platforms: ["youtube"] },
    { id: 2, title: "YouTube Video 2", url: "https://example.com/video2.mp4", date: "2023-08-02", platforms: ["youtube", "tiktok"] },
  ],
  tiktok: [
    { id: 3, title: "TikTok Video 1", url: "https://example.com/tiktok1.mp4", date: "2023-08-03", platforms: ["tiktok"] },
    { id: 4, title: "TikTok Video 2", url: "https://example.com/tiktok2.mp4", date: "2023-08-04", platforms: ["tiktok", "instagram"] },
  ],
  instagram: [
    { id: 5, title: "Instagram Video 1", url: "https://example.com/insta1.mp4", date: "2023-08-05", platforms: ["instagram"] },
    { id: 6, title: "Instagram Video 2", url: "https://example.com/insta2.mp4", date: "2023-08-06", platforms: ["instagram", "youtube"] },
  ],
};

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  platforms: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must select at least one platform.",
  }),
});

const VideoCard = ({ video, onEdit }) => (
  <Card className="w-full max-w-sm mx-auto">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{video.title}</CardTitle>
      <Button variant="ghost" size="sm" onClick={() => onEdit(video)}>
        <Pencil className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      <div className="aspect-[9/16] bg-slate-200 rounded-md overflow-hidden">
        <video
          src={video.url}
          controls
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">Scheduled: {video.date}</p>
    </CardContent>
  </Card>
);

const EditVideoDialog = ({ video, isOpen, onClose, onSave, onDelete }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video.title,
      date: video.date,
      platforms: video.platforms,
    },
  });

  const onSubmit = (data) => {
    onSave({ ...video, ...data });
    onClose();
  };

  const [selectedTime, setSelectedTime] = useState("12:00");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



<FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            
            
            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Platforms</FormLabel>
                    <FormDescription>
                      Select the platforms for this video.
                    </FormDescription>
                  </div>
                  {["youtube", "tiktok", "instagram"].map((platform) => (
                    <FormField
                      key={platform}
                      control={form.control}
                      name="platforms"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={platform}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(platform)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, platform])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== platform
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="destructive" onClick={() => onDelete(video.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Video
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function ScheduledVideo() {
  const [activeTab, setActiveTab] = useState("youtube");
  const [editingVideo, setEditingVideo] = useState(null);
  const [videos, setVideos] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate()

  const handleEditVideo = (video) => {
    setEditingVideo(video);
  };

  const handleSaveVideo = (updatedVideo) => {
    setVideos(prevVideos => {
      const newVideos = { ...prevVideos };
      Object.keys(newVideos).forEach(platform => {
        newVideos[platform] = newVideos[platform].map(v => 
          v.id === updatedVideo.id ? updatedVideo : v
        );
      });
      return newVideos;
    });
    setEditingVideo(null);
  };

  const handleDeleteVideo = (videoId) => {
    setVideos(prevVideos => {
      const newVideos = { ...prevVideos };
      Object.keys(newVideos).forEach(platform => {
        newVideos[platform] = newVideos[platform].filter(v => v.id !== videoId);
      });
      return newVideos;
    });
    setEditingVideo(null);
  };

const fetchInitialVideo = async () => {
  try {
    setIsLoading(true);
    const csrftoken = await getCsrfToken();
    if (id === null || !csrftoken) {
      return navigate('/login');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/videos-by-platforms/${id}/`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ platform: activeTab }), // Send the activeTab as a JSON object
    });

    const data = await response.json(); 
    if (!response.ok) {
      showToast(data.error.message || "Failed to fetch videos", 'error');
      setIsLoading(false);
    } else {
      setVideos(data.data); // Assuming the response has the structure { data: [...] }
      setIsLoading(false);
    }
  } catch (error) {
    showToast("Whoops, something went wrong while fetching videos");
    setIsLoading(false);
  }
}


  useEffect(() => {
    fetchInitialVideo()
  }, [activeTab])

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
        {isLoading ? <LoadingSpinner/> : <main className="flex-1 overflow-auto p-4 sm:p-6">
          <h1 className="text-3xl font-bold mb-6">Scheduled Videos</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>
            {videos !== null && videos.map((video) => (
              <TabsContent key={activeTab} value={activeTab}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {platformVideos.map((video) => (
                    <VideoCard key={video.id} video={video} onEdit={handleEditVideo} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      }
        
      </div>
      {editingVideo && (
        <EditVideoDialog
          video={editingVideo}
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={handleSaveVideo}
          onDelete={handleDeleteVideo}
        />
      )}
    </div>
  );
}