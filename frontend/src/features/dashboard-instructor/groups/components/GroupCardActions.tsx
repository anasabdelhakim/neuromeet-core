"use client";

import { useState, useActionState, useTransition, useEffect } from "react";
import { MoreVertical, Edit2, Trash2, Loader, Copy, Mail, Share2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { deleteGroupAction, updateGroupAction } from "../actions/groups-actions";
import { CreateGroupState, Group } from "../types/groups-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createGroupSchema } from "@/src/validations/zod";

export function GroupCardActions({ group }: { group: Group }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const updateActionWithId = updateGroupAction.bind(null, group.id);
  const [state, action, pending] = useActionState<CreateGroupState, FormData>(
    updateActionWithId,
    { success: false }
  );

  const {
    register,
    formState: { errors, isValid },
    reset,
  } = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: group.name,
      subject: group.subject || "",
      description: group.description || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (state.success) {
      reset();
      setIsEditDialogOpen(false);
    }
  }, [state.success, reset]);

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteGroupAction(group.id);
      setIsDeleteDialogOpen(false);
    });
  };


  const enrollmentsCount = group._count?.enrollments ?? group.enrollments?.length ?? 0;
  const hasStudents = Number(enrollmentsCount) > 0;

  return (
    <>
      <Popover>
        <PopoverTrigger render={          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={isDeleting}>
            <MoreVertical className="w-4 h-4" />
          </Button>}>

        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1 flex flex-col gap-0.5">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-8 px-2 text-sm font-normal" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Group
          </Button>

          {hasStudents ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Group
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full justify-start h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={handleDelete}
            >
              {isDeleting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeleting ? "Deleting..." : "Delete Group"}
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!isDeleting) setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-destructive font-medium block mb-2">Warning: This group has {enrollmentsCount} enrolled students.</span>
              Deleting this group will immediately remove all students from it and delete all associated data. This action cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete Group"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-soft border bg-card backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Group</DialogTitle>
            <DialogDescription>
              Update your group details below.
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
                />
                <FieldError>{errors.description?.message}</FieldError>
              </Field>
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !isValid}>
                {pending ? (
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
    </>
  );
}
