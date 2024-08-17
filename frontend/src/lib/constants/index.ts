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
  { href: "/integration", icon: Plug, label: "Integration" },
  { href: "/autopilot", icon: Plane, label: "Auto Pilot" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: LogOut, label: "Logout" }
];