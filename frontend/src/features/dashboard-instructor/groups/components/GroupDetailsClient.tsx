"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/src/components/ui/input";
import { Card } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  MoreHorizontal,
  Mail,
  Trash2,
  Users,
  Search,
  Plus,
  Loader,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { inviteStudentToGroup, undoInvitationToGroup, removeStudentFromGroup } from "../actions/groups-actions";
import { cn } from "@/src/lib/utils";

interface GroupDetailsClientProps {
  group: any;
  allStudents: any[];
}

export function GroupDetailsClient({ group, allStudents }: GroupDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const [pendingInvites, setPendingInvites] = useState<Set<string>>(
    new Set((group.invitations || []).map((inv: any) => inv.studentId))
  );

  useEffect(() => {
    setPendingInvites(new Set((group.invitations || []).map((inv: any) => inv.studentId)));
  }, [group]);

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const enrolledStudentIds = useMemo(() => {
    return new Set(group.enrollments.map((e: any) => e.student?.id));
  }, [group]);

  const availableStudents = useMemo(() => {
    return allStudents.filter(s => !enrolledStudentIds.has(s.id));
  }, [allStudents, enrolledStudentIds]);

  const handleInviteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setPendingInvites(prev => new Set(prev).add(studentId));

    startTransition(async () => {
      const result = await inviteStudentToGroup(group.id, studentId);

    });
  };

  const handleUndoInvite = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setPendingInvites(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });

    startTransition(async () => {
      const result = await undoInvitationToGroup(group.id, studentId);

    });
  };

  const handleRemoveStudent = (studentId: string) => {
    setActivePopoverId(null);
    startTransition(async () => {
      const res = await removeStudentFromGroup(group.id, studentId);
      if (!res?.success) {
        setActiveAlertId(null);
      }
    });
  };

  const filteredEnrollments = useMemo(() => {
    if (!searchQuery.trim()) return group.enrollments;
    const q = searchQuery.toLowerCase();
    return group.enrollments.filter((e: any) => {
      const s = e.student;
      if (!s) return false;
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    });
  }, [group.enrollments, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-black-soft-subtle p-6 rounded-soft border border-border">
        <div className="space-y-2 flex-1">
          <Link href="/dashboard-instructor/groups" className="text-sm text-primary-light hover:underline flex items-center mb-2">
            <ChevronLeft size={16} className="mr-1" /> Back to Groups
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          <p className="text-muted-foreground">{group.description || "No description provided."}</p>
          <div className="flex items-center gap-4 mt-2">

            <div className="text-sm">
              <span className="text-muted-foreground">Members: </span>
              <span className="font-bold">{group.enrollments.length}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-3">
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger render={
              <Button disabled={isPending} className="bg-primary text-primary-foreground">
                {isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Student
              </Button>
            } />
            <PopoverContent className="w-[300px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Search students..." />
                <CommandList>
                  <CommandEmpty>No students found.</CommandEmpty>
                  <CommandGroup heading="Available Students">
                    {availableStudents.map((student) => (
                      <CommandItem
                        key={student.id}
                        value={student.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1 truncate">
                            <span className="text-sm truncate">{student.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                          </div>
                        </div>
                        {pendingInvites.has(student.id) ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive-soft"
                            onClick={(e) => handleUndoInvite(student.id, e as any)}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs bg-black-soft hover:bg-white/10"
                            onClick={(e) => handleInviteStudent(student.id, e as any)}
                          >
                            Add
                          </Button>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {}
      <Card className="bg-black-soft-subtle border-border rounded-soft p-2 overflow-hidden">
        <div className="sm:p-3 py-3 px-1 gap-2 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold px-2 text-lg">Students</h3>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              maxLength={50}
              className="pl-9 h-9 bg-black-soft-muted border-border focus-visible:ring-primary"
            />
          </div>
        </div>

        <Table className="w-full min-w-max text-base">
          <TableHeader>
            <TableRow className="bg-black-soft hover:bg-black-soft">
              <TableHead className="py-4 pl-5">Student</TableHead>
              <TableHead className="py-4">Email</TableHead>
              <TableHead className="py-4">Joined At</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No members found in this group.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEnrollments.map((e: any) => {
                const student = e.student;
                if (!student) return null;

                const lastSessionDate = student.sessions?.[0]?.lastUsedAt ? new Date(student.sessions[0].lastUsedAt) : null;
                const lastMeetingDate = student.meetingParticipants?.length > 0 
                  ? student.meetingParticipants.reduce((latest: Date | null, p: any) => {
                      const joinedAt = p.joinedAt ? new Date(p.joinedAt) : null;
                      if (!latest) return joinedAt;
                      return joinedAt && joinedAt > latest ? joinedAt : latest;
                    }, null)
                  : null;

                const lastActiveDate = lastSessionDate || lastMeetingDate;

                const isActive = lastActiveDate ? (new Date().getTime() - lastActiveDate.getTime() < 24 * 60 * 60 * 1000) : false;

                return (
                  <TableRow key={student.id} className="border-b border-border last:border-0 hover:bg-black-soft transition-colors duration-fast">
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs font-bold bg-primary-soft-muted text-primary-light">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-sm text-muted-foreground truncate max-w-[180px]">
                      {student.email}
                    </TableCell>

                    <TableCell className="py-4 text-sm text-muted-foreground" suppressHydrationWarning>
                      {new Date(e.joinedAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2" suppressHydrationWarning>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-status-success animate-pulse" : "bg-muted-foreground")} suppressHydrationWarning />
                        <span className="text-sm text-muted-foreground whitespace-nowrap" suppressHydrationWarning>{isActive ? "Active" : "Offline"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 pr-5 text-right">
                      <AlertDialog 
                        open={activeAlertId === student.id} 
                        onOpenChange={(isOpen) => setActiveAlertId(isOpen ? student.id : null)}
                      >
                        <Popover 
                          open={activePopoverId === student.id} 
                          onOpenChange={(isOpen) => setActivePopoverId(isOpen ? student.id : null)}
                        >
                          <PopoverTrigger render={
                            <Button disabled={isPending} variant="ghost" size="icon" className="h-8 w-8 rounded-medium text-muted-foreground hover:text-foreground hover:bg-white-soft-muted">
                              <MoreHorizontal size={16} />
                            </Button>
                          } />

                          {activePopoverId === student.id && (
                            <PopoverContent align="end" className="w-44 p-1 flex flex-col gap-0.5">
                              <AlertDialogTrigger render={
                                <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 size={14} className="mr-2" /> Remove
                                </Button>
                              } />
                            </PopoverContent>
                          )}
                        </Popover>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from group?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                            <Button 
                              variant="destructive" 
                              disabled={isPending}
                              onClick={() => handleRemoveStudent(student.id)}
                            >
                              {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                              Remove
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
