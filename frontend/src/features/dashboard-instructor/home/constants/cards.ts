import { CalendarPlus, Link2, Plus, Video } from "lucide-react";

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
  {
    id: "recordings",
    icon: Video,
    title: "Recordings",
    desc: "Access your saved lectures",
    cta: "Search",
    gradFrom: "from-[#ffca41]/20",
    iconBg: "bg-[#ffca41]/15 text-[#ffca41]",
    glow: "hover:shadow hover:shadow-[#ffca41]/10",
  },
] as const;

export const gradientMap: Record<string, string> = {
  new: "bg-action-new-gradient",
  join: "bg-action-join-gradient",
  schedule: "bg-action-schedule-gradient",
  recordings: "bg-action-recordings-gradient",
};

export const iconGradientMap: Record<string, string> = {
  new: "bg-icon-new-gradient",
  join: "bg-icon-join-gradient",
  schedule: "bg-icon-schedule-gradient",
  recordings: "bg-icon-recordings-gradient",
};

export const shadowMap: Record<string, string> = {
  new: "shadow-none hover:shadow-action-new-40",
  join: "shadow-none hover:shadow-action-join-40",
  schedule: "shadow-none hover:shadow-action-schedule-40",
  recordings: "shadow-none hover:shadow-action-recordings-40",
};

export const buttonGradientMap: Record<string, string> = {
  new: "bg-btn-new-gradient",
  join: "bg-btn-join-gradient",
  schedule: "bg-btn-schedule-gradient",
  recordings: "bg-btn-recordings-gradient",
};

export const dialogBgMap: Record<string, string> = {
  new: "bg-dialog-bg-new border-action-new-soft-50 shadow-2xl shadow-action-new-15",
  join: "bg-dialog-bg-join border-action-join-soft shadow-2xl shadow-action-join-15",
  schedule:
    "bg-dialog-bg-schedule border-action-schedule-soft shadow-2xl shadow-action-schedule-15",
  recordings:
    "bg-dialog-bg-recordings border-action-recordings-soft shadow-2xl shadow-action-recordings-15",
};

