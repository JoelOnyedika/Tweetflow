// Icons from Lucide React
import { Video, LayoutDashboard, Plus, Mic, Calendar, LayoutTemplate, Plug, Plane, Settings, LogOut } from "lucide-react";

// Sidebar Links Constant
export const sidebarLinks = [
  { href: "#", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/createvideo", icon: Plus, label: "Create Video" },
  { href: "/createvoice", icon: Mic, label: "Voice Clone" },
  { href: "/scheduledvideo", icon: Calendar, label: "Scheduled Videos" },
  { href: "/videolibrary", icon: Video, label: "Video Library" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/integrations", icon: Plug, label: "Integration" },
  { href: "/autopilot", icon: Plane, label: "Auto Pilot" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: LogOut, label: "Logout" }
];

export const integrations = [
  {
    name: "YouTube",
    icon: "https://www.youtube.com/favicon.ico",
    description: "Upload videos directly to your YouTube channel.",
    connected: true,
    autoUpload: true,
  },
  {
    name: "TikTok",
    icon: "https://www.tiktok.com/favicon.ico",
    description: "Share your videos on TikTok automatically.",
    connected: false,
    autoUpload: false,
  },
  {
    name: "Instagram",
    icon: "https://www.instagram.com/favicon.ico",
    description: "Post your videos to Instagram with ease.",
    connected: true,
    autoUpload: false,
  },
  {
    name: "Twitter",
    icon: "https://twitter.com/favicon.ico",
    description: "Tweet your videos and reach your audience.",
    connected: false,
    autoUpload: false,
  },
];

export const UPLOAD_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube Shorts' },
  { id: 'instagram', name: 'Instagram Reels' },
];

export const UPLOAD_INTERVALS = [
  { id: 'hourly', name: 'Every Hour' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
];