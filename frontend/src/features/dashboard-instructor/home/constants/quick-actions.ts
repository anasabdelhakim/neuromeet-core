import { CalendarPlus, Link2, Plus } from "lucide-react";

export const Cards = [
  {
    id: "new",
    icon: Plus,
    title: "Immediate Session",
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
] as const;

export const gradientMap: Record<string, string> = {
  new: "bg-action-new-gradient",
  join: "bg-action-join-gradient",
  schedule: "bg-action-schedule-gradient",
};

export const iconGradientMap: Record<string, string> = {
  new: "bg-icon-new-gradient",
  join: "bg-icon-join-gradient",
  schedule: "bg-icon-schedule-gradient",
};

export const shadowMap: Record<string, string> = {
  new: "shadow-none hover:shadow-action-new-deep",
  join: "shadow-none hover:shadow-action-join-deep",
  schedule: "shadow-none hover:shadow-action-schedule-deep",
};

export const buttonGradientMap: Record<string, string> = {
  new: "bg-btn-new-gradient",
  join: "bg-btn-join-gradient",
  schedule: "bg-btn-schedule-gradient",
};

export const dialogBgMap: Record<string, string> = {
  new: "bg-dialog-bg-new border-destructive-soft-hover shadow-hard shadow-action-new-muted",
  join: "bg-dialog-bg-join border-action-join-soft shadow-hard shadow-action-join-muted",
  schedule:
    "bg-dialog-bg-schedule border-action-schedule-soft shadow-hard shadow-action-schedule-muted",
};
