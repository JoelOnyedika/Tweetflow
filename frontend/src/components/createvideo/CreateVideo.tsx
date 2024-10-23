import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Sidebar from "@/components/hero/Sidebar";
import DashNavbar from "@/components/hero/DashNavbar";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { getCsrfToken } from '@/lib/funcs';
import { useToast } from '@/components/customs/Toast';
import { useParams, useNavigate } from "react-router-dom";
import {Volume2, Loader2} from 'lucide-react'


const formSchema = z.object({
  text: z.string().min(1, {
    message: "Tweet content is required.",
  }),
  template: z.string({
    required_error: "Please select a template.",
  }),
  voice: z.string({
    required_error: "Please select a voice.",
  }),
});

export default function CreateVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [templatesList, setTemplatesList] = useState(null);
  const [voiceList, setVoiceList] = useState(null);
  const [videoText, setVideoText] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('')
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(null)

  const fetchVoiceModels = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-voice-by-id/${id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      
      const { data, error } = await response.json();
      if (error) {
        showToast(error.message, 'error');
        console.log(error)
      } else {
        console.log(data)
        setVoiceList(data);
      }
    } catch (error) {
      console.error('Error fetching your voice models:', error);
      showToast("Failed to load your voice models. Please try again.", 'error');
    }
  };


  const fetchTemplatesData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-templates/${id}/`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const { data, error } = await response.json();
      
      if (response.status === 401) {
        console.log('User not authenticated, redirecting to login...');
        navigate('/login');
      } else if (error) {
        showToast(error.message, 'error');
      } else {
        setTemplatesList(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast("Failed to load templates. Please refresh the page.", 'error');
    }
  };

  const videoData = {}

  useEffect(() => {
    fetchVoiceModels();
    fetchTemplatesData();
  }, [id]);

  useEffect(() => {
    if (selectedVoice) { 
      setAudioPreviewUrl(selectedVoice.preview_url);
    }

    console.log(selectedVoice, selectedTemplate, videoText)

  }, [selectedVoice, audioPreviewUrl, selectedTemplate, videoText]);


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "A codebase without tests is a codebase designed to fail",
    },
  });

  async function onSubmit(values:any) {
    console.log(values);
    try {
      setIsLoading(true)
      openWebSocketConnection()

      const csrftoken = await getCsrfToken()
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/create-video/`, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(values)
      })
      const { data, error } = await response.json()
      
      if (error) {
        setIsLoading(false)
        console.log(error)
        showToast(error.message, 'error')
      }
      console.log(data, error)
      setIsLoading(false)  
    }
    catch(error) {
      console.log(error)
      showToast('Something went wrong. Please refresh.', 'error')
      setIsLoading(false)
    }
  }

  const openWebSocketConnection = () => {
    const ws = new WebSocket(`${import.meta.env.VITE_BACKEND_WSS_SERVER_URL}/ws/estimate/`)

    ws.onopen = () => {
      console.log('WebSocket connection opened')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.estimated_time) {
        setEstimatedTime(data.estimated_time)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket connection closed')
    }

    ws.onerror = (error) => {
      console.log("WebSocket error: ", error)
    }
  }


 const handleVoiceChange = (value) => {
    setSelectedVoice(value);
    form.setValue('voice', value);
  };

  const handleTextChange = (e) => {
    setVideoText(e.target.value)
    form.setValue('text', videoText);
  };

 const handleTemplateChange = (value) => {
    // console.log("Selected template:", value);
    const temp = templatesList.find(v => v.id === value);
    if (temp) {
      setSelectedTemplate(temp.id);
      console.log('1', selectedTemplate)
      form.setValue('template', value);
    }
  };

const playAudioPreview = () => {
  if (!audioPreviewUrl) {
    showToast("Please select a voice first", 'error');
    return;
  }

  setIsAudioLoading(true);
  const audio = new Audio(audioPreviewUrl);
  
  audio.oncanplaythrough = () => {
    setIsAudioLoading(false);
    audio.play();
  };

  audio.onerror = () => {
    setIsAudioLoading(false);
    showToast("Something went wrong while loading voice preview", 'error');
  };
};

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ToastContainer />
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
        {templatesList === null || voiceList === null ? (
          <LoadingSpinner />
        ) : (
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tweet Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your tweet content here..."
                              className="min-h-[150px]"
                              {...field}
                              onChange={handleTextChange}
                              value={videoText}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Template</FormLabel>
                          <Select onValueChange={handleTemplateChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templatesList && templatesList.map((data) => (
                                <SelectItem key={data.template_name} value={data.id}  onClick={() => setTemplate(data.id)}>
                                  {data.template_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="">
                      <FormField
                      control={form.control}
                      name="voice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Voice</FormLabel>
                          <Select onValueChange={handleVoiceChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {voiceList && voiceList.map((data) => (
                                <SelectItem key={data.id} value={data.voice_id} onClick={setAudioPreviewUrl(data.preview_url)}>
                                  {data.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                          )}
                        />
                      </div>
                      <Button onClick={playAudioPreview} type="button">
                      {isAudioLoading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                      </Button>
                      <div>
                      <a href={`/${id}/voicestore`} className="flex underline">
                        Checkout the voice store for more voice models
                      </a>
                      </div>
                    </div>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="flex aspect-[9/16] items-center justify-center bg-muted p-6">
                        <video
                          className="w-full h-full object-cover"
                          controls
                          src="your-video-source.mp4"
                          alt="Your Video"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </CardContent>
                    </Card>
                    <Button type="submit" disabled={videoText === null || selectedVoice === null || selectedTemplate === null || isLoading} className="w-full">
                      {estimatedTime ? `Estimated processing time: ${estimatedTime}` : isLoading ? "Generating video. This might take a while": "Create Video"}
                      {estimatedTime}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </main>
        )}
      </div>
    </div>
  );
}
