"use client";

import { useState } from "react";
import {
  Cards,
  gradientMap,
  iconGradientMap,
  shadowMap,
  buttonGradientMap,
  dialogBgMap,
} from "../constants/cards";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                "flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-full transform-gpu will-change-transform",
                gradientClass,
                shadowClass,
              )}
            >
              <CardHeader>
                <div className={cn("w-fit p-3 rounded-xl", iconGradientClass)}>
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
            "sm:max-w-md backdrop-blur-2xl border p-6 rounded-2xl",
            activeDialogClass,
          )}
        >
          <DialogHeader className="mb-2">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner",
                activeIconGradientClass,
              )}
            >
              <ActiveIcon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {activeCard.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1.5 leading-relaxed">
              {activeCard.desc}. Please enter the required details below to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            {activeCard.id === "new" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-300">
                    Session Name
                  </Label>
                  <Input
                    placeholder="e.g. Ad-hoc Q&A"
                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#FF8F71]/50 focus-visible:border-[#FF8F71] transition-all h-12 px-4 rounded-xl"
                  />
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-lg transition-all rounded-xl hover:scale-[1.02] border border-white/10 hover:brightness-110",
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
                  <Label className="text-sm font-medium text-slate-300">
                    Room Code or Link
                  </Label>
                  <Input
                    placeholder="Enter 6-digit code or URL..."
                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#4B89FF]/50 focus-visible:border-[#4B89FF] transition-all h-12 px-4 rounded-xl"
                  />
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-lg transition-all rounded-xl hover:scale-[1.02] border border-white/10 hover:brightness-110",
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
                  <Label className="text-sm font-medium text-slate-300">
                    Lecture Topic
                  </Label>
                  <Input
                    placeholder="e.g. Advanced AI Architecture"
                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#BC61F4]/50 focus-visible:border-[#BC61F4] transition-all h-12 px-4 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-300">
                    Date & Time
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        "w-full mb-2 border-2 flex items-center justify-start bg-black/40 border-white/10 text-left font-normal h-12 px-4 rounded-xl hover:bg-black/60 hover:text-white transition-all focus-visible:ring-[#BC61F4]/50 focus-visible:border-[#BC61F4] outline-none",
                        !date && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-none bg-transparent shadow-none"
                      align="start"
                    >
                      <Card className="mx-auto w-fit bg-card/90 backdrop-blur-3xl border-white/10 text-white shadow-xl rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3"
                          />
                        </CardContent>
                        <CardFooter className="border-t border-white/10 bg-black/40 p-4">
                          <FieldGroup className="w-full gap-4">
                            <Field className="space-y-1">
                              <FieldLabel
                                htmlFor="time-from"
                                className="text-xs text-slate-400"
                              >
                                Start Time
                              </FieldLabel>
                              <InputGroup className="bg-black/40 border-white/10 rounded-lg">
                                <InputGroupInput
                                  id="time-from"
                                  type="time"
                                  step="1"
                                  defaultValue="10:30:00"
                                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-white h-9 [color-scheme:dark]"
                                />
                                <InputGroupAddon>
                                  <Clock2Icon className="text-slate-400 h-4 w-4" />
                                </InputGroupAddon>
                              </InputGroup>
                            </Field>
                            <Field className="space-y-1">
                              <FieldLabel
                                htmlFor="time-to"
                                className="text-xs text-slate-400"
                              >
                                End Time
                              </FieldLabel>
                              <InputGroup className="bg-black/40 border-white/10 rounded-lg">
                                <InputGroupInput
                                  id="time-to"
                                  type="time"
                                  step="1"
                                  defaultValue="12:30:00"
                                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-white h-9 [color-scheme:dark]"
                                />
                                <InputGroupAddon>
                                  <Clock2Icon className="text-slate-400 h-4 w-4" />
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
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-lg transition-all rounded-xl hover:scale-[1.02] border border-white/10 hover:brightness-110",
                    activeButtonClass,
                  )}
                >
                  {activeCard.cta}
                </Button>
              </div>
            )}
            {activeCard.id === "recordings" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-300">
                    Search Keyword
                  </Label>
                  <Input
                    placeholder="Search by topic, date, or tag..."
                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#FFCA41]/50 focus-visible:border-[#FFCA41] transition-all h-12 px-4 rounded-xl"
                  />
                </div>
                <Button
                  className={cn(
                    "w-full h-12 mt-2 text-white font-semibold text-base shadow-lg transition-all rounded-xl hover:scale-[1.02] border border-white/10 hover:brightness-110",
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
