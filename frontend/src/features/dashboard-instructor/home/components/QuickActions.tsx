"use client";
import { useState, useActionState, useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createMeetingAction, joinSessionAction } from "../actions/meeting-actions";
import {
  Cards,
  gradientMap,
  iconGradientMap,
  shadowMap,
  buttonGradientMap,
  dialogBgMap,
} from "../constants/quick-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingSchema } from "@/src/validations/zod";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock2Icon, ChevronDownIcon, Loader } from "lucide-react";
import { cn } from "@/src/lib/utils";
function SubmitButton({ cta, btnClass, disabled }: { cta: string, btnClass: string, disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn(
        "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border hover:brightness-110",
        btnClass,
      )}
    >
      {pending ? "Please wait..." : cta}
    </Button>
  );
}
export function QuickActions() {
  const [activeCardId, setActiveCardId] = useState<string | null>("new");
  const [isOpen, setIsOpen] = useState(false);
  const activeCard = Cards.find((c) => c.id === activeCardId) || Cards[0];
  const activeIconGradientClass = iconGradientMap[activeCard.id] || "";
  const activeButtonClass = buttonGradientMap[activeCard.id] || "";
  const activeDialogClass = dialogBgMap[activeCard.id] || "";
  const ActiveIcon = activeCard.icon;
  const [date, setDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeFrom, setTimeFrom] = useState("");
  const [state, action, pending] = useActionState(createMeetingAction, { success: true, errorMessage: "" });
  const [joinState, joinAction, joinPending] = useActionState(joinSessionAction, { success: true, errorMessage: "" });
  const router = useRouter();
  const [joinLink, setJoinLink] = useState("");
  const handleJoin = () => {
    if (!joinLink) return;
    setIsOpen(false);
    try {
      const url = new URL(joinLink);
      router.push(joinLink);
    } catch {
      router.push(`/livekit?room=${joinLink}`);
    }
  };
  const {
    register: registerNew,
    formState: { errors: errorsNew, isValid: isValidNew },
    reset: resetNew,
  } = useForm<z.infer<typeof meetingSchema>>({
    resolver: zodResolver(meetingSchema),
    mode: "onChange",
  });
  const {
    register: registerSchedule,
    formState: { errors: errorsSchedule, isValid: isValidSchedule },
    reset: resetSchedule,
  } = useForm<z.infer<typeof meetingSchema>>({
    resolver: zodResolver(meetingSchema),
    mode: "onChange",
  });
  useEffect(() => {
    if (!isOpen) {
      resetNew();
      resetSchedule();
      setJoinLink("");
    }
  }, [isOpen, resetNew, resetSchedule]);
  const scheduledAtIso = useMemo(() => {
    if (!date || !timeFrom) return "";
    const d = new Date(date);
    const [hours, minutes] = timeFrom.split(":").map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }, [date, timeFrom]);
  useEffect(() => {
    const now = new Date();
    setDate(new Date(now.getFullYear(), now.getMonth(), now.getDate())); // Set default date to today without time
    now.setMinutes(now.getMinutes() + 2); // Set default start time 2 mins in the future
    setTimeFrom(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
  }, []);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {Cards.map((card) => {
          const Icon = card.icon;
          const gradientClass = gradientMap[card.id] || "";
          const iconGradientClass = iconGradientMap[card.id] || "";
          const shadowClass = shadowMap[card.id] || "";
          return (
            <Card
              key={card.id}
              onClick={() => {
                setActiveCardId(card.id);
                setIsOpen(true);
              }}
              className={cn(
                "flex flex-col cursor-pointer transition-all duration-normal ease-standard hover:scale-[1.02] active:scale-[0.98] h-full transform-gpu will-change-transform",
                gradientClass,
                shadowClass,
              )}
            >
              <CardHeader>
                <div className={cn("w-fit p-3 rounded-soft", iconGradientClass)}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold mt-3">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-foreground">
                  {card.desc}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "sm:max-w-md backdrop-blur-2xl border p-6 !rounded-soft",
            activeDialogClass,
          )}
        >
          <DialogHeader className="mb-2">
            <div
              className={cn(
                "w-12 h-12 rounded-soft flex items-center justify-center mb-4 shadow-inner",
                activeIconGradientClass,
              )}
            >
              <ActiveIcon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {activeCard.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
              {activeCard.desc}. Please enter the required details below to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            {!state.success && state.errorMessage && activeCard.id !== "join" && (
              <div className="animate-alert-entrance">
                <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                  {state.errorMessage}
                </p>
              </div>
            )}
            {activeCard.id === "new" && (
              <form action={action} className="space-y-4">
                <input type="hidden" name="type" value="instant" />
                <div>
                  <Field>
                    <FieldLabel htmlFor="title">Lecture Topic <span className="text-red-500">*</span></FieldLabel>
                    <Input
                      id="title"
                      {...registerNew("title")}
                      placeholder="e.g. Ad-hoc Q&A"
                      aria-invalid={!!errorsNew.title}
                      disabled={pending}
                      maxLength={50}
                      className="bg-black-soft-muted focus-visible:ring-action-new-input focus-visible:border-action-new transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                    />
                    <FieldError>{errorsNew.title?.message}</FieldError>
                  </Field>
                </div>
                <Button
                  type="submit"
                  disabled={pending || !isValidNew}
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {pending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                  {activeCard.cta}
                </Button>
              </form>
            )}
            {activeCard.id === "join" && (
              <form action={joinAction} className="space-y-4">
                {!joinState.success && joinState.errorMessage && (
                  <div className="animate-alert-entrance">
                    <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                      {joinState.errorMessage}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="roomCode" className="text-sm font-medium text-muted-foreground-mid">
                    Room Code or Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="roomCode"
                    name="roomCode"
                    placeholder="Enter 6-digit code or URL..."
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    disabled={joinPending}
                    aria-invalid={!joinState.success}
                    maxLength={500}
                    className="bg-black-soft-muted focus-visible:ring-action-join-input focus-visible:border-action-join transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={joinPending || !joinLink.trim()}
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {joinPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                  {joinPending ? "Joining..." : activeCard.cta}
                </Button>
              </form>
            )}
            {activeCard.id === "schedule" && (
              <form action={action} className="space-y-4">
                <input type="hidden" name="type" value="schedule" />
                <input type="hidden" name="scheduledAtIso" value={scheduledAtIso} />
                <div>
                  <Field>
                    <FieldLabel htmlFor="schedule-title">Lecture Topic <span className="text-red-500">*</span></FieldLabel>
                    <Input
                      id="schedule-title"
                      {...registerSchedule("title")}
                      placeholder="e.g. Advanced AI Architecture"
                      aria-invalid={!!errorsSchedule.title}
                      disabled={pending}
                      maxLength={50}
                      className="bg-black-soft-muted focus-visible:ring-action-schedule-input focus-visible:border-action-schedule transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                    />
                    <FieldError>{errorsSchedule.title?.message}</FieldError>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium text-muted-foreground-mid">Date <span className="text-red-500">*</span></Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger render={
                        <Button
                          variant="outline"
                          disabled={pending}
                          className={cn(
                            "w-full justify-between font-normal bg-black-soft-muted h-12 border-none rounded-soft hover:bg-black-soft-deep hover:text-white transition-all duration-fast ease-standard focus-visible:ring-action-schedule-input outline-none mb-1",
                            !date && "text-muted-foreground",
                          )}
                        >
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      } />
                      <PopoverContent
                        className="w-auto p-0 border-none bg-transparent shadow-none"
                        align="start"
                      >
                        <Card className="mx-auto w-fit bg-card backdrop-blur-3xl text-white shadow-hard rounded-soft overflow-hidden">
                          <CardContent className="p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(d) => {
                                setDate(d);
                                setIsCalendarOpen(false);
                              }}
                              initialFocus
                              className="p-3"
                            />
                          </CardContent>
                        </Card>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="time-from" className="text-sm font-medium text-muted-foreground-mid">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="time"
                      id="time-from"
                      name="timeFrom"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      required
                      disabled={pending}
                      suppressHydrationWarning
                      className="bg-black-soft-muted focus-visible:ring-action-schedule-input focus-visible:border-action-schedule transition-all duration-fast ease-standard h-12 px-4 rounded-soft [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
                <SubmitButton cta={activeCard.cta} btnClass={activeButtonClass} disabled={pending || !isValidSchedule} />
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
