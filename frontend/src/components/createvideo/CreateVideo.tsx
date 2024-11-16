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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoIcon, WandSparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Sidebar from "@/components/hero/Sidebar";
import DashNavbar from "@/components/hero/DashNavbar";
import LoadingSpinner from "@/components/customs/LoadingSpinner";
import { getCsrfToken, chopUserCredits } from "@/lib/funcs";
import { useToast } from "@/components/customs/Toast";
import { useParams, useNavigate } from "react-router-dom";
import { Volume2, Loader2 } from "lucide-react";
import { creditSystem } from "@/lib/constants";

const formSchema = z.object({
  title: z.string(),

  text: z.string().min(10, {
    message: "Video content is required.",
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
  const [voiceList, setVoiceList] = useState(null); // must be null
  const [voiceId, setVoiceId] = useState(null); // must be null
  const [videoText, setVideoText] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "A codebase without tests is a codebase designed to fail",
      title: "Words of wisdom",
      voiceId: "",
    },
  });

  useEffect(() => {
    form.setValue("text", videoText, { shouldDirty: true, shouldTouch: true });
    form.setValue("title", videoTitle, {
      shouldDirty: true,
      shouldTouch: true,
    });
    form.setValue("voiceId", voiceId, { shouldDirty: true, shouldTouch: true });
  }, [videoText, form, videoTitle, voiceId]);

  useEffect(() => {
    fetchVoiceModels();
    fetchTemplatesData();
  }, []);

  useEffect(() => {
    if (selectedVoice) {
      setAudioPreviewUrl(selectedVoice.preview_url);
      setVoiceId(selectedVoice.voice_id);
    }
  }, [selectedVoice, audioPreviewUrl, selectedTemplate]);

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
        showToast(error.message, "error");
        console.log(error);
      } else {
        console.log(data);
        setVoiceList(data);
      }
    } catch (error) {
      console.error("Error fetching your voice models:", error);
      showToast("Failed to load your voice models. Please try again.", "error");
    }
  };

  const fetchTemplatesData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-templates/${id}/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const { data, error } = await response.json();

      if (response.status === 401) {
        console.log("User not authenticated, redirecting to login...");
        navigate("/login");
      } else if (error) {
        showToast(error.message, "error");
      } else {
        setTemplatesList(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      showToast("Failed to load templates. Please refresh the page.", "error");
    }
  };

  const calculateEstimatedTime = (text: string) => {
    const textLen = text.length;
    const avg = 2.6;
    const duration = textLen * avg;
    return duration;
  };

  const startCountdown = () => {
    setTimeLeft(calculateEstimatedTime(videoText));
    setIsLoading(true);
  };

  async function uploadVideoToDB(returned: any) {
    const csrftoken = await getCsrfToken();

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/upload-video/${
        returned.user_id
      }/`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        method: "POST",
        credentials: "include",
        body: JSON.stringify(returned),
      }
    );

    const { data, error } = await response.json();

    clearInterval(intervalId);
    setProgress(100);

    if (error) {
      setIsLoading(false);
      console.log(error);
      showToast(error.message, "error");
    } else {
      console.log(data);
    }
  }

  async function onSubmit(values: any) {
    console.log(values);

    try {
      setIsLoading(true);
      const { data: creditData, error: creditError } = await chopUserCredits(
        id,
        creditSystem.createVideo
      );
      if (creditData) {
        const text = values.text || "";
        const totalDuration = calculateEstimatedTime(text);
        let timeLeft = totalDuration;
        let intervalSpeed = 1000; // Initial speed of 1 second interval

        const intervalId = setInterval(() => {
          timeLeft -= intervalSpeed / 1000;
          let currentProgress =
            ((totalDuration - timeLeft) / totalDuration) * 100;

          if (currentProgress >= 95 && currentProgress < 99 && timeLeft > 0) {
            intervalSpeed = 3000;
          }

          if (currentProgress >= 99) {
            currentProgress = 99;
            setProgress(currentProgress.toFixed(2));
            return;
          }

          setProgress(currentProgress.toFixed(2));

          if (timeLeft <= 0) {
            clearInterval(intervalId);
            setProgress(100);
          }
        }, intervalSpeed);

        const csrftoken = await getCsrfToken();

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/create-video/`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,
            },
            method: "POST",
            credentials: "include",
            body: JSON.stringify(values),
          }
        );

        const { data, error } = await response.json();

        clearInterval(intervalId);
        setProgress(100);

        if (error) {
          setIsLoading(false);
          console.log(error);
          showToast(error.message, "error");
        } else {
          console.log(data);
          setVideoUrl(data.video_url);
          uploadVideoToDB(data);
        }

        setIsLoading(false);
      } else {
        setIsLoading(false);
        showToast(creditError.message, "error");
        // setProgress(100)
      }
    } catch (error) {
      console.log(error);
      showToast("Something went wrong. Please refresh.", "error");
      setIsLoading(false);
    }
  }

  const handleVoiceChange = (value) => {
    setSelectedVoice(value);
    form.setValue("voice", value);
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setVideoText(newValue);
  };

  const handleTitleChange = (e) => {
    const newValue = e.target.value;
    setVideoTitle(newValue);
  };

  const handleTemplateChange = (value) => {
    // console.log("Selected template:", value);
    const temp = templatesList.find((v) => v.id === value);
    if (temp) {
      setSelectedTemplate(temp.id);
      console.log("1", selectedTemplate);
      form.setValue("template", value);
    }
  };

  const playAudioPreview = () => {
    if (!audioPreviewUrl) {
      showToast("Please select a voice first", "error");
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
      showToast("Something went wrong while loading voice preview", "error");
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tweet Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your tweet title here..."
                              value={videoTitle}
                              onChange={handleTitleChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              value={videoText}
                              onChange={handleTextChange}
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
                          <Select
                            onValueChange={handleTemplateChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templatesList &&
                                templatesList.map((data) => (
                                  <SelectItem
                                    key={data.template_name}
                                    value={data.id}
                                    onClick={() => setTemplate(data.id)}
                                  >
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
                            <Select
                              onValueChange={handleVoiceChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a voice" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {voiceList &&
                                  voiceList.map((data) => (
                                    <>
                                      <SelectItem
                                        key={data.id}
                                        value={data.voice_id}
                                        onClick={setAudioPreviewUrl(
                                          data.preview_url
                                        )}
                                      >
                                        {data.name}
                                      </SelectItem>
                                    </>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button onClick={playAudioPreview} type="button">
                      {isAudioLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Volume2 />
                      )}
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
                          controlsList="nodownload"
                          src={videoUrl}
                          alt="Your Video"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </CardContent>
                    </Card>
                    <Button
                      type="submit"
                      disabled={
                        videoTitle == "" ||
                        videoText === "" ||
                        selectedVoice === null ||
                        selectedTemplate === null ||
                        isLoading
                      }
                      className="w-full"
                    >
                      <span className="font-semibold flex">
                        {isLoading ? (
                          `Processing... ${progress}%`
                        ) : (
                          <>
                            {" "}
                            <WandSparkles className="w-4 h-4 mr-3 mt-1" />{" "}
                            Create Video: {creditSystem.createVideo} Credits{" "}
                          </>
                        )}
                      </span>
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
