"use client";

import { useActionState, useState } from "react";
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
import { Label } from "@/src/components/ui/label";
import { PlusCircle, Loader } from "lucide-react";

export function CreateGroupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action, pending] = useActionState<CreateGroupState, FormData>(createGroupAction, { success: false });

  // Close dialog on success
  if (state.success && isOpen) setIsOpen(false);

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
            <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
              {state.error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Computer Science 101"
              className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject (Optional)
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="e.g., Programming"
              className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Brief description about the group..."
              className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
            />
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
            <Button type="submit"  disabled={pending}>
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
