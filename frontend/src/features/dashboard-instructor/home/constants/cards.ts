import { CalendarPlus, Link2, Plus, Video } from "lucide-react";

export const Cards = [
  {
    id: "new",
    icon: Plus,
    title: "New Session",
    desc: "Start an instant live session",
    cta: "Start Now",
    href: "/livekit",
    gradFrom: "from-brand-cyan-soft-muted",
    iconBg: "bg-brand-cyan-soft-subtle text-brand-cyan",
    glow: "hover:shadow hover:shadow-brand-cyan-soft-muted",
  },
  {
    id: "join",
    icon: Link2,
    title: "Join Session",
    desc: "Enter a room code or link",
    cta: "Join",
    hasInput: true,
    gradFrom: "from-brand-purple-soft-muted",
    iconBg: "bg-brand-purple-soft-subtle text-brand-purple",
    glow: "hover:shadow-brand-purple-soft-muted",
  },
  {
    id: "schedule",
    icon: CalendarPlus,
    title: "Schedule",
    desc: "Plan your next lecture",
    cta: "Plan Now",
    gradFrom: "from-primary-soft-muted",
    iconBg: "bg-primary-soft-muted text-primary-light",
    glow: "hover:shadow-primary-soft-muted",
  },
  {
    id: "recordings",
    icon: Video,
    title: "Recordings",
    desc: "Access your saved lectures",
    cta: "Search",
    gradFrom: "from-action-yellow-soft-muted",
    iconBg: "bg-action-yellow-soft-subtle text-action-yellow",
    glow: "hover:shadow hover:shadow-action-yellow-subtle",
  },
] as const;

export const gradientMap: Record<string, string> = {
  new: "bg-action-new-gradient",
  join: "bg-action-join-gradient",
  schedule: "bg-action-schedule-gradient",
  recordings: "bg-action-yellow-gradient",
};

export const iconGradientMap: Record<string, string> = {
  new: "bg-icon-new-gradient",
  join: "bg-icon-join-gradient",
  schedule: "bg-icon-schedule-gradient",
  recordings: "bg-icon-yellow-gradient",
};

export const shadowMap: Record<string, string> = {
  new: "shadow-action-new-subtle hover:shadow-action-new-deep",
  join: "shadow-action-join-subtle hover:shadow-action-join-deep",
  schedule: "shadow-action-schedule-subtle hover:shadow-action-schedule-deep",
  recordings: "shadow-action-yellow-subtle hover:shadow-action-yellow-deep",
};

export const buttonGradientMap: Record<string, string> = {
  new: "bg-btn-new-gradient",
  join: "bg-btn-join-gradient",
  schedule: "bg-btn-schedule-gradient",
  recordings: "bg-btn-yellow-gradient",
};

export const dialogBgMap: Record<string, string> = {
  new: "bg-dialog-bg-new border-action-new-input shadow-action-new-muted",
  join: "bg-dialog-bg-join border-action-join-input shadow-action-join-muted",
  schedule:
    "bg-dialog-bg-schedule border-action-schedule-input shadow-action-schedule-muted",
  recordings:
    "bg-dialog-bg-yellow border-action-yellow-input shadow-action-yellow-muted",
};

