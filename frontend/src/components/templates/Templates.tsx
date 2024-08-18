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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { VideoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const formSchema = z.object({
  voiceName: z.string().min(2, {
    message: "Voice name must be at least 2 characters.",
  }),
  voiceFile: z.instanceof(File).refine((file) => file.size <= 5000000, {
    message: "Voice file must be less than 5MB.",
  }),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

export default function Templates() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceName: "",
      voiceFile: null,
      agreeTerms: false,
    },
  });

  function onSubmit(values) {
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
          <div className="inline-flex justify-between items-center w-full">
            <h1 className="text-3xl font-bold mb-6">Templates</h1>
            <Link to="/templatecreator">
              <Button>
                <Plus />{" "}
                <span className="hidden md:flex">Create Template </span>
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="w-full max-w-sm mx-auto">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-center">
                  Card title
                </CardTitle>
              </CardHeader>
              <CardContent className="aspect-[9/16] bg-slate-200 rounded-md overflow-hidden"></CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
