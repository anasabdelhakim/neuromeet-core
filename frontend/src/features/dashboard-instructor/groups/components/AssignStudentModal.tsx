"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
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
import { inviteStudentToGroup, undoInvitationToGroup, removeStudentFromGroup } from "../actions/groups-actions";

interface AssignStudentModalProps {
  groups: any[];
  allStudents: any[];
}

export function AssignStudentModal({ groups, allStudents }: AssignStudentModalProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const assignGroupId = searchParams.get("assignGroupId");
  const [isPending, startTransition] = useTransition();

  const group = useMemo(() => groups.find(g => g.id === assignGroupId), [groups, assignGroupId]);

  const [pendingInvites, setPendingInvites] = useState<Set<string>>(new Set());

  const [removedStudents, setRemovedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (group) {
      setPendingInvites(new Set((group.invitations || []).map((inv: any) => inv.studentId)));
      setRemovedStudents(new Set());
    }
  }, [group]);

  const enrolledStudentIds = useMemo(() => {
    if (!group) return new Set();
    return new Set((group.enrollments || []).map((e: any) => e.student?.id));
  }, [group]);

  const displayStudents = useMemo(() => {
    return [...allStudents].sort((a, b) => {
      const aEnrolled = enrolledStudentIds.has(a.id) && !removedStudents.has(a.id);
      const bEnrolled = enrolledStudentIds.has(b.id) && !removedStudents.has(b.id);
      if (aEnrolled && !bEnrolled) return -1;
      if (!aEnrolled && bEnrolled) return 1;
      return 0;
    });
  }, [allStudents, enrolledStudentIds, removedStudents]);

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const closeDialog = () => {
    router.replace(pathname, { scroll: false });
  };

  const handleInviteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    
    setPendingInvites(prev => new Set(prev).add(studentId));
    
    startTransition(async () => {
      const result = await inviteStudentToGroup(group.id, studentId);
      // Removed revert and alert to keep optimistic UI as requested
    });
  };

  const handleUndoInvite = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    
    setPendingInvites(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });

    startTransition(async () => {
      const result = await undoInvitationToGroup(group.id, studentId);
      // Removed revert and alert to keep optimistic UI as requested
    });
  };

  const handleRemoveStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    
    setRemovedStudents(prev => new Set(prev).add(studentId));
    startTransition(async () => {
      await removeStudentFromGroup(group.id, studentId);
    });
  };

  if (!group) return null;

  return (
    <Dialog open={!!assignGroupId} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="rounded-soft border bg-card backdrop-blur-2xl p-0 overflow-hidden max-w-md">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold">Assign Student</DialogTitle>
          <DialogDescription>
            Search for available students to invite to <span className="font-semibold text-foreground">{group.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Command className="bg-transparent">
          <CommandInput placeholder="Search students..." className="h-12 px-1 border-none focus:ring-0" />
          <CommandList className="max-h-[300px]">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No students found.</CommandEmpty>
            <CommandGroup heading="All Students" className="p-2">
              {displayStudents.map((student) => {
                const isEnrolled = enrolledStudentIds.has(student.id) && !removedStudents.has(student.id);
                const isInvitePending = pendingInvites.has(student.id);
                
                return (
                  <CommandItem
                    key={student.id}
                    value={student.name}
                    onSelect={() => {}}
                    className="flex items-center justify-between gap-3 py-2 pl-3 pr-0 my-1 rounded-sm cursor-default data-[selected=true]:bg-accent/50"
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary-soft-muted text-primary-light">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">{student.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 text-xs shrink-0 m-0"
                            disabled={isPending}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Remove
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from group?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={(e) => handleRemoveStudent(student.id, e as any)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : isInvitePending ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 text-xs shrink-0 m-0"
                        onClick={(e) => handleUndoInvite(student.id, e)}
                        disabled={isPending}
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 text-xs bg-black-soft hover:bg-white/10 shrink-0 m-0"
                        onClick={(e) => handleInviteStudent(student.id, e)}
                        disabled={isPending}
                      >
                        Add
                      </Button>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          </Command>
      </DialogContent>
    </Dialog>
  );
}
