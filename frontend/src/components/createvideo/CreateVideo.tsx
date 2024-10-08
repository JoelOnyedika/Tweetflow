import React, { useState } from "react";
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
import { useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/customs/LoadingSpinner"


const formSchema = z.object({
  tweetContent: z.string().min(1, {
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
  const { id } = useParams()
  const navigate = useNavigate()

  const [templatesList, setTemplatesList] = useState(null)
  const [voiceList, setVoiceList] = useState([])
  
  const fetchTemplatesData = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/get-templates/${id}/`, {
      method: 'GET',
      credentials: 'include',
    })

    const {data, error} = await response.json();
    setTemplatesList(data)
    
        if (response.status === 401) {
          console.log('User not authenticated, redirecting to login...');
          navigate('/login'); // Redirect to the login route if not authenticated
        } else {
          console.log('Error:', response.status);
        }
  }
  useEffect(() => {
    // confirmId()
    fetchTemplatesData()
  }, [id])


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tweetContent: "A codebase without test, is a codebase designed to fail",
    },
  });

  function onSubmit(values) {
    // Handle form submission
    console.log(values);
  }

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
        { templatesList === null ? <LoadingSpinner /> :(
          <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="tweetContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tweet Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your tweet content here..."
                            className="min-h-[150px]"
                            {...field}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {templatesList.map((data: any) => (
                            <SelectItem value={data.template_name}>{data.template_name}</SelectItem>
                          ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Voice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {voiceList.map((data: any) => (
                            <SelectItem value={data.template_name}>{data.template_name}</SelectItem>
                          ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="flex aspect-[9/16] items-center justify-center bg-muted p-6">
                      <video
                        className="w-full h-full object-cover"
                        controls
                        src="your-video-source.mp4" // Replace this with your video source
                        alt="Your Video"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </CardContent>
                  </Card>
                  <Button type="submit" className="w-full">Create Video</Button>
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