import { CalendarPlus, Link2, Plus } from "lucide-react";

export const Cards = [
  {
    id: "new",
    icon: Plus,
    title: "New Session",
    desc: "Start an instant live session",
    cta: "Start Now",
    href: "/livekit",
    gradFrom: "from-[#00d2ff]/20",
    iconBg: "bg-[#00d2ff]/15 text-[#00d2ff]",
    glow: "hover:shadow hover:shadow-[#00d2ff]/10",
  },
  {
    id: "join",
    icon: Link2,
    title: "Join Session",
    desc: "Enter a room code or link",
    cta: "Join",
    hasInput: true,
    gradFrom: "from-purple-600/20",
    iconBg: "bg-purple-600/15 text-purple-400",
    glow: "hover:shadow-purple-500/10",
  },
  {
    id: "schedule",
    icon: CalendarPlus,
    title: "Schedule",
    desc: "Plan your next lecture",
    cta: "Plan Now",
    gradFrom: "from-primary/20",
    iconBg: "bg-primary/15 text-[#38bcd8]",
    glow: "hover:shadow-primary/10",
  },
] as const;

export const gradientMap: Record<string, string> = {
  new: "bg-[linear-gradient(135deg,rgba(255,143,113,0.3)_0%,rgba(255,143,113,0.9)_40%,rgba(225,90,70,0.9)_100%)]",
  join: "bg-[linear-gradient(135deg,rgba(75,137,255,0.3)_0%,rgba(75,137,255,0.9)_40%,rgba(50,108,255,0.9)_100%)]",
  schedule:
    "bg-[linear-gradient(135deg,rgba(188,97,244,0.3)_0%,rgba(188,97,244,0.9)_40%,rgba(140,68,212,0.9)_100%)]",
};

export const iconGradientMap: Record<string, string> = {
  new: "bg-[linear-gradient(315deg,rgba(255,143,113,0.2)_0%,rgba(255,143,113,0.9)_40%,rgba(225,90,70,0.9)_100%)]",
  join: "bg-[linear-gradient(315deg,rgba(75,137,255,0.2)_0%,rgba(75,137,255,0.9)_40%,rgba(50,108,255,0.9)_100%)]",
  schedule:
    "bg-[linear-gradient(315deg,rgba(188,97,244,0.2)_0%,rgba(188,97,244,0.9)_40%,rgba(140,68,212,0.9)_100%)]",
};

export const shadowMap: Record<string, string> = {
  new: "shadow-none hover:shadow-xl hover:shadow-[#ff8f71]/40",
  join: "shadow-none hover:shadow-xl hover:shadow-[#4b89ff]/40",
  schedule: "shadow-none hover:shadow-xl hover:shadow-[#bc61f4]/40",
};

export const buttonGradientMap: Record<string, string> = {
  new: "bg-[linear-gradient(135deg,rgba(255,143,113,1)_0%,rgba(225,90,70,1)_100%)]",
  join: "bg-[linear-gradient(135deg,rgba(75,137,255,1)_0%,rgba(50,108,255,1)_100%)]",
  schedule:
    "bg-[linear-gradient(135deg,rgba(188,97,244,1)_0%,rgba(140,68,212,1)_100%)]",
};

export const dialogBgMap: Record<string, string> = {
  new: "bg-[rgba(25,10,5,0.95)] border-red-500/20 shadow-2xl shadow-[#ff8f71]/15",
  join: "bg-[rgba(5,10,25,0.95)] border-blue-500/20 shadow-2xl shadow-[#4b89ff]/15",
  schedule:
    "bg-[rgba(15,5,25,0.95)] border-purple-500/20 shadow-2xl shadow-[#bc61f4]/15",
};
