"use client";

import { useState } from "react";
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
  CardFooter,
} from "@/src/components/ui/card";
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
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock2Icon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function QuickActions() {
  const [activeCardId, setActiveCardId] = useState<string | null>("new");
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  const activeCard = Cards.find((c) => c.id === activeCardId) || Cards[0];

  const activeIconGradientClass = iconGradientMap[activeCard.id] || "";
  const activeButtonClass = buttonGradientMap[activeCard.id] || "";
  const activeDialogClass = dialogBgMap[activeCard.id] || "";
  const ActiveIcon = activeCard.icon;

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
            {activeCard.id === "new" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground-mid">
                    Session Name
                  </Label>
                  <Input
                    placeholder="e.g. Ad-hoc Q&A"
                    className="bg-black-soft-muted focus-visible:ring-action-new-input focus-visible:border-action-new transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                  />
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {activeCard.cta}
                </Button>
              </div>
            )}
            {activeCard.id === "join" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground-mid">
                    Room Code or Link
                  </Label>
                  <Input
                    placeholder="Enter 6-digit code or URL..."
                    className="bg-black-soft-muted focus-visible:ring-action-join-input focus-visible:border-action-join transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                  />
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {activeCard.cta}
                </Button>
              </div>
            )}
            {activeCard.id === "schedule" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground-mid">
                    Lecture Topic
                  </Label>
                  <Input
                    placeholder="e.g. Advanced AI Architecture"
                    className="bg-black-soft-muted  focus-visible:ring-action-schedule-input focus-visible:border-action-schedule transition-all duration-fast ease-standard h-12 px-4 rounded-soft"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground-mid">
                    Date & Time
                  </Label>
                  <Popover>
                    <PopoverTrigger
                          className={cn(
                            "w-full mb-2 border-2 flex items-center justify-start bg-black-soft-muted  text-left font-normal h-12 px-4 rounded-soft hover:bg-black-soft-deep hover:text-white transition-all duration-fast ease-standard focus-visible:ring-action-schedule-input focus-visible:border-action-schedule outline-none",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-none bg-transparent shadow-none"
                      align="start"
                    >
                      <Card className="mx-auto w-fit bg-card backdrop-blur-3xl  text-white shadow-hard rounded-soft overflow-hidden">
                        <CardContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3"
                          />
                        </CardContent>
                        <CardFooter className="border-t border-border bg-black-soft-muted p-4">
                          <FieldGroup className="w-full gap-4">
                            <Field className="space-y-1">
                              <FieldLabel
                                htmlFor="time-from"
                                className="text-xs text-muted-foreground"
                              >
                                Start Time
                              </FieldLabel>
                              <InputGroup className="bg-black-soft-muted  rounded-soft">
                                <InputGroupInput
                                  id="time-from"
                                  type="time"
                                  step="1"
                                  defaultValue="10:30:00"
                                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-white h-9 [color-scheme:dark]"
                                />
                                <InputGroupAddon>
                                  <Clock2Icon className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                              </InputGroup>
                            </Field>
                            <Field className="space-y-1">
                              <FieldLabel
                                htmlFor="time-to"
                                className="text-xs text-muted-foreground"
                              >
                                End Time
                              </FieldLabel>
                              <InputGroup className="bg-black-soft-muted  rounded-soft">
                                <InputGroupInput
                                  id="time-to"
                                  type="time"
                                  step="1"
                                  defaultValue="12:30:00"
                                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-white h-9 [color-scheme:dark]"
                                />
                                <InputGroupAddon>
                                  <Clock2Icon className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                              </InputGroup>
                            </Field>
                          </FieldGroup>
                        </CardFooter>
                      </Card>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-hard transition-all duration-normal ease-standard rounded-soft hover:scale-[1.02] border  hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {activeCard.cta}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
