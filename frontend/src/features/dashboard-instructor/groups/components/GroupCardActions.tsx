"use client";

import { useState, useActionState, useTransition } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Group, CreateGroupState } from "../types/groups-types";
import { updateGroupAction, deleteGroupAction } from "../actions/groups-actions";

export function GroupCardActions({ group }: { group: Group }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const updateActionWithId = updateGroupAction.bind(null, group.id);
  const [state, action, pending] = useActionState<CreateGroupState, FormData>(
    updateActionWithId,
    { success: false }
  );

  if (state.success && isEditDialogOpen) {
    setIsEditDialogOpen(false);
  }

  const handleDelete = () => {
    startDelete(async () => {
      await deleteGroupAction(group.id);
    });
  };


  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={isDeleting} />
            }
          >
            {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit2 className="w-4 h-4" /> Edit Group
            </DropdownMenuItem>

            <AlertDialogTrigger render={
              <DropdownMenuItem variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Group
              </DropdownMenuItem>
            } />
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All associated data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete Group</AlertDialogAction>
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
                defaultValue={group.name}
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
                defaultValue={group.subject || ""}
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
                defaultValue={group.description || ""}
                placeholder="Brief description about the group..."
                className="bg-black-soft-muted rounded-soft focus-visible:ring-primary h-11"
              />
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
              <Button type="submit"  disabled={pending}>
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
