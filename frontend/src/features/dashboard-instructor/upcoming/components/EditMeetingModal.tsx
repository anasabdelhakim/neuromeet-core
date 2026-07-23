"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { editMeetingAction } from "../../home/actions/meeting-actions";
import { Loader, ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { formatEgyptTime } from "@/src/lib/format-date";
import { cn } from "@/src/lib/utils";
import { Card, CardContent } from "@/src/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingSchema } from "@/src/validations/zod";
interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  initialTitle: string;
  initialDateTime: string;
}

export function EditMeetingModal({
  isOpen,
  onClose,
  meetingId,
  initialTitle,
  initialDateTime,
}: EditMeetingModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof meetingSchema>>({
    resolver: zodResolver(meetingSchema),
    defaultValues: { title: initialTitle },
    mode: "onChange",
  });

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const d = initialDateTime ? new Date(initialDateTime) : new Date();
      setDate(d);
      setTime(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
      reset({ title: initialTitle });
      setErrorMessage("");
    }
  }, [isOpen, initialTitle, initialDateTime]);

  const onSubmitForm = async (data: z.infer<typeof meetingSchema>) => {
    if (!date) return;
    setIsLoading(true);

    const dateStr = formatEgyptTime(date, "yyyy-MM-dd");
    const scheduledAt = new Date(`${dateStr}T${time}`).toISOString();

    const res = await editMeetingAction(meetingId, {
      title: data.title,
      scheduledAt,
    });

    setIsLoading(false);

    if (res.success) {
      setErrorMessage("");
      onClose();
    } else {
      setErrorMessage(res.errorMessage || "Failed to update meeting");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-soft border bg-card backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Meeting</DialogTitle>
          <DialogDescription>
            Update your meeting details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5 pt-2">
          {errorMessage && (
            <div className="animate-alert-entrance">
              <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                {errorMessage}
              </p>
            </div>
          )}
          <div>
            <Field>
              <FieldLabel htmlFor="title">Lecture Topic</FieldLabel>
              <Input
                id="title"
                {...register("title")}
                aria-invalid={!!errors.title}
                disabled={isLoading}
                maxLength={50}
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11 w-full"
              />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium">Date <span className="text-red-500">*</span></Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger render={ <Button
                    variant="outline"
                    disabled={isLoading}
                    className={cn(
                      "w-full justify-between font-normal bg-black-soft-muted h-11 border-none rounded-soft hover:bg-black-soft-deep hover:text-white transition-all duration-fast ease-standard focus-visible:ring-primary outline-none mb-1",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? formatEgyptTime(date, "PPP") : <span>Pick a date</span>}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>}>
                </PopoverTrigger>
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
              <Label className="text-sm font-medium">Time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
