// Icons from Lucide React
import {
  Video,
  LayoutDashboard,
  Plus,
  Mic,
  Calendar,
  LayoutTemplate,
  Plug,
  Plane,
  Settings,
  LogOut,
} from "lucide-react";

// Sidebar Links Constant
export const sidebarLinks = [
  { href: "#", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/createvideo", icon: Plus, label: "Create Video" },
  { href: "/createvoice", icon: Mic, label: "Voice Clone" },
  { href: "/scheduledvideo", icon: Calendar, label: "Scheduled Videos" },
  { href: "/videolibrary", icon: Video, label: "Video Library" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/integrations", icon: Plug, label: "Integration" },
  { href: "/voicestore", icon: Mic, label: "Voice Store" },
  { href: "/autopilot", icon: Plane, label: "Auto Pilot" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: LogOut, label: "Logout" },
];

export const creditSystem = {
  createTemplate: 5,
  createVideo: 10,
  downloadVideo: 5,
};

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
  { id: "all", name: "All" },
  { id: "randomize", name: "Randomize" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube Shorts" },
  { id: "instagram", name: "Instagram Reels" },
];

export const UPLOAD_INTERVALS = [
  { id: "hourly", name: "Every Hour" },
  { id: "half-a-day", name: "Every 12 Hours" },
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
];

export const voiceModels = [
  { id: 1, name: "Sarah", type: "Standard", price: null, inPlan: true },
  { id: 2, name: "John", type: "Standard", price: null, inPlan: true },
  { id: 3, name: "Emily", type: "Premium", price: 9.99, inPlan: false },
  { id: 4, name: "Michael", type: "Premium", price: 14.99, inPlan: false },
  { id: 5, name: "Sophia", type: "Custom", price: 29.99, inPlan: false },
  { id: 6, name: "David", type: "Standard", price: null, inPlan: true },
  { id: 7, name: "Olivia", type: "Premium", price: 12.99, inPlan: false },
  { id: 8, name: "Daniel", type: "Custom", price: 34.99, inPlan: false },
];

export const planTiers = [
  { tier: 0, plan: "free" },
  { tier: 1, plan: "basic", price: 5 },
  { tier: 2, plan: "moderate", price: 4.5 },
  { tier: 3, plan: "standard", price: 4 },
  { tier: 4, plan: "premuim", price: 3 },
];
