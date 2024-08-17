import React from "react";
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

const formSchema = z.object({
  tweetContent: z.string().min(1, {
    message: "Tweet content is required.",
  }),
  template: z.string({
    required_error: "Please select a template.",
  }),
});

export default function CreateVideo() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tweetContent: "",
      template: "",
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
                            <SelectItem value="template1">Template 1</SelectItem>
                            <SelectItem value="template2">Template 2</SelectItem>
                            <SelectItem value="template3">Template 3</SelectItem>
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
      </div>
    </div>
  );
}