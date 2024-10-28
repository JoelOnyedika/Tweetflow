import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { VideoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {useParams} from 'react-router-dom'

const formSchema = z.object({
  voiceName: z.string().min(2, {
    message: "Voice name must be at least 2 characters.",
  }),
  voiceFile: z.instanceof(File).refine((file) => file.size <= 9000000, {
    message: "Voice file must be lesser than 9MB.",
  }),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

export default function CreateVoice() {
  const {id} = useParams()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceName: "",
      voiceFile: null,
      agreeTerms: false,
    },
  });

  const isFormValid = form.watch("voiceName") && form.watch("voiceFile") && form.watch("agreeTerms");

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append("userId", id)
    formData.append("voiceName", values.voiceName);
    formData.append("voiceFile", values.voiceFile);
    formData.append("agreeTerms", values.agreeTerms);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/upload-voice/`, { 
        method: "POST",
        body: formData,
      });
      const data  = await response.json();
      console.log("Voice ID:", data.voice_id);
    } catch (error) {
      console.error("Error uploading voice:", error);
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
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <h1 className="text-3xl font-bold mb-6">Voice Clone</h1>
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="voiceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter voice name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voiceFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Upload Voice File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => onChange(e.target.files[0])}
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the terms and conditions</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!isFormValid}>Submit</Button>
              </form>
            </Form>
            <Card>
              <CardHeader>
                <CardTitle>How to Upload Your Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Choose a unique name for your voice clone</li>
                  <li>Record a clear audio sample of your voice</li>
                  <li>Upload the audio file (must be less than 5MB)</li>
                  <li>Agree to the terms and conditions</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
