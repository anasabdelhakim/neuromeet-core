"use client";

import { useActionState, useState, useEffect } from "react";
import { createGroupAction } from "../actions/groups-actions";
import { CreateGroupState } from "../types/groups-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { PlusCircle, Loader } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createGroupSchema } from "@/src/validations/zod";

export function CreateGroupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action, pending] = useActionState<CreateGroupState, FormData>(createGroupAction, { success: false });

  const {
    register,
    formState: { errors, isValid },
    reset,
  } = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (state.success) {
      reset();
      setIsOpen(false);
    }
  }, [state.success, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 shadow-medium py-5" />
        }
      >
        <PlusCircle className="w-4 h-4" />
        Create Group
      </DialogTrigger>
      <DialogContent className="rounded-soft border bg-card backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create a New Group</DialogTitle>
          <DialogDescription>
            Create a new group to invite students and manage meetings.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-5 pt-2">
          {state.error && (
            <div className="animate-alert-entrance">
              <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                {state.error}
              </p>
            </div>
          )}
          <div>
            <Field>
              <FieldLabel htmlFor="name">Group Name <span className="text-red-500">*</span></FieldLabel>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Computer Science 101"
                aria-invalid={!!errors.name}
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
                disabled={pending}
                maxLength={50}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
          </div>
          <div>
            <Field>
              <FieldLabel htmlFor="subject">Subject (Optional)</FieldLabel>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="e.g., Programming"
                aria-invalid={!!errors.subject}
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
                disabled={pending}
                maxLength={50}
              />
              <FieldError>{errors.subject?.message}</FieldError>
            </Field>
          </div>
          <div>
            <Field>
              <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
              <Input
                id="description"
                {...register("description")}
                placeholder="Brief description about the group..."
                aria-invalid={!!errors.description}
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
                disabled={pending}
                maxLength={150}
              />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}

              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !isValid}>
              {pending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
