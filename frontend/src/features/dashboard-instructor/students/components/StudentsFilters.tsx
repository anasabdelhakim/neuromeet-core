"use client";
import { useState, useMemo } from "react";
import { Student, StudentGroup } from "../types";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Search,
  Mail,
  CalendarDays,
  Activity,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users,
  LineChart,
  Loader,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
interface StudentsFiltersProps {
  groups: StudentGroup[];
  students: Student[];
}
const ITEMS_PER_PAGE = 5;
export function StudentsFilters({ groups, students }: StudentsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const handleMessageStudent = (loadingKey: string, email: string) => {
    setMessagingId(loadingKey);
    setTimeout(() => {
      window.location.href = `mailto:${email}`;
      setMessagingId(null);
      setActivePopoverId(null);
    }, 1000);
  };
  const filteredStudents = useMemo(() => {
    let result = students;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    if (selectedGroup) {
      result = result.filter((s) => s.groups.some(g => g.name === selectedGroup));
    }
    return result;
  }, [students, searchQuery, selectedGroup]);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, safePage]);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search
  };
  const handleGroupSelect = (groupName: string | null) => {
    setSelectedGroup(groupName);
    setCurrentPage(1); // Reset page on filter
  };
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar: Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name or email..."
            maxLength={50}
            className="pl-9 h-12  rounded-soft focus-visible:ring-primary"
          />
        </div>
      </div>
      {/* Group Filter Pills (Horizontal Slider) */}
      <div className="w-full overflow-hidden relative">
        {/* CSS hides scrollbar but keeps scroll functionality */}
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => handleGroupSelect(null)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-fast border whitespace-nowrap snap-start",
              !selectedGroup 
                ? "bg-primary text-primary-foreground border-primary shadow-soft" 
                : "bg-black-soft-muted text-muted-foreground border-border hover:bg-black-soft-subtle hover:text-foreground"
            )}
          >
            All Groups
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group.name)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-fast border flex items-center gap-2 whitespace-nowrap snap-start",
                selectedGroup === group.name
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-black-soft-muted text-muted-foreground border-border hover:bg-black-soft-subtle hover:text-foreground"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", group.color)} />
              {group.name}
              <span className="opacity-50 font-normal">({group.memberCount})</span>
            </button>
          ))}
        </div>
      </div>
      {/* ----------------- DESKTOP VIEW ----------------- */}
      <div className="hidden md:block border border-border rounded-soft overflow-hidden bg-black-soft-subtle pt-2">
        <Table className="w-full min-w-max text-base">
          <TableHeader>
            <TableRow className="">
              <TableHead className="py-4 pl-5">Student</TableHead>
              <TableHead className="py-4">Email</TableHead>
              <TableHead className="py-4">Group</TableHead>
              <TableHead className="py-4">Last Active</TableHead>
              <TableHead className="py-4">Meetings</TableHead>
              <TableHead className="py-4">Engagement</TableHead>
              <TableHead className="py-4 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No students found.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} className="border-b border-border last:border-0 hover:bg-black-soft transition-colors duration-fast">
                  <TableCell className="py-4 pl-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-primary-soft-muted text-primary-light">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex flex-col">
                        <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">Enrolled {student.enrolledDate}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground truncate max-w-[180px]">
                    {student.email}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      {student.groups.slice(0, 2).map(g => (
                        <div key={g.name} className="flex items-center gap-1.5 bg-black-soft px-2 py-1 rounded-full border border-border">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", g.color)} />
                          <span className="text-xs text-foreground whitespace-nowrap">{g.name}</span>
                        </div>
                      ))}
                      {student.groups.length > 2 && (
                        <div className="flex items-center bg-black-soft px-2 py-1 rounded-full border border-border">
                          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">+{student.groups.length - 2} more</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", student.isActive ? "bg-status-success animate-pulse" : "bg-muted-foreground")} />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{student.lastActive}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-foreground">
                    {student.totalMeetings}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 w-full max-w-[120px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[40px]">
                        <div 
                          className={cn("h-full rounded-full", student.avgEngagement >= 85 ? "bg-status-success" : student.avgEngagement >= 70 ? "bg-status-warning" : "bg-destructive")} 
                          style={{ width: `${student.avgEngagement}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold shrink-0">{student.avgEngagement}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-5 text-right">
                    <Popover 
                      open={activePopoverId === student.id} 
                      onOpenChange={(isOpen) => setActivePopoverId(isOpen ? student.id : null)}
                    >
                      <PopoverTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-medium text-muted-foreground hover:text-foreground hover:bg-white-soft-muted">
                            <MoreHorizontal size={16} />
                          </Button>
                        }
                      />
                      {/* Only render content DOM if this specific popover is active */}
                      {activePopoverId === student.id && (
                        <PopoverContent align="end" className="w-48 p-1 flex flex-col gap-0.5">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-8 px-2 text-sm font-normal"
                            disabled={messagingId === student.id}
                            onClick={() => handleMessageStudent(student.id, student.email)}
                          >
                            {messagingId === student.id ? (
                              <Loader size={14} className="animate-spin mr-2 text-primary-light" />
                            ) : (
                              <Mail size={14} className="text-primary-light mr-2" />
                            )}
                            {messagingId === student.id ? "Opening Mail..." : "Message Student"}
                          </Button>
                          <Button render={<Link href={`/dashboard-instructor/students/${student.id}/analytics`} />} nativeButton={false} variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal">
                            <LineChart size={14} className="text-status-success mr-2" /> View Analytics
                          </Button>
                        </PopoverContent>
                      )}
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Desktop Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-black-soft-muted border-t border-border">
          <span className="text-sm text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{Math.min(filteredStudents.length, (safePage - 1) * ITEMS_PER_PAGE + 1)}</strong> to <strong className="text-foreground">{Math.min(filteredStudents.length, safePage * ITEMS_PER_PAGE)}</strong> of <strong className="text-foreground">{filteredStudents.length}</strong> students
          </span>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-8 px-3 rounded-medium border-border/50 text-xs"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] sm:max-w-[180px] scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button 
                  key={idx}
                  variant={safePage === idx + 1 ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-medium text-xs font-bold snap-start", 
                    safePage !== idx + 1 && "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-8 px-3 rounded-medium border-border/50 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      {/* ----------------- MOBILE VIEW ----------------- */}
      <div className="md:hidden flex flex-col gap-4">
        {paginatedStudents.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-border rounded-soft bg-black-soft-subtle">
             <Users className="h-10 w-10 mb-3 opacity-20" />
             <p>No students found.</p>
           </div>
        ) : (
          paginatedStudents.map((student) => (
            <Card key={student.id} className="p-4 border-border bg-black-soft-subtle rounded-soft flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm font-bold bg-primary-soft-muted text-primary-light">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                </div>
                <Popover 
                  open={activePopoverId === `mobile-${student.id}`} 
                  onOpenChange={(isOpen) => setActivePopoverId(isOpen ? `mobile-${student.id}` : null)}
                >
                  <PopoverTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-medium -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={18} />
                      </Button>
                    }
                  />
                  {activePopoverId === `mobile-${student.id}` && (
                    <PopoverContent align="end" className="w-48 p-1 flex flex-col gap-0.5">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-8 px-2 text-sm font-normal"
                        disabled={messagingId === `mobile-${student.id}`}
                        onClick={() => handleMessageStudent(`mobile-${student.id}`, student.email)}
                      >
                        {messagingId === `mobile-${student.id}` ? (
                          <Loader size={14} className="animate-spin mr-2 text-primary-light" />
                        ) : (
                          <Mail size={14} className="text-primary-light mr-2" />
                        )}
                        {messagingId === `mobile-${student.id}` ? "Opening Mail..." : "Message Student"}
                      </Button>
                      <Button render={<Link href={`/dashboard-instructor/students/${student.id}/analytics`} />} nativeButton={false} variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal">
                        <LineChart size={14} className="text-status-success mr-2" /> View Analytics
                      </Button>
                    </PopoverContent>
                  )}
                </Popover>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {student.groups.slice(0, 2).map(g => (
                    <div key={g.name} className="flex items-center gap-1.5 bg-black-soft px-2 py-1 rounded-full border border-border">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", g.color)} />
                      <span className="text-xs text-foreground whitespace-nowrap">{g.name}</span>
                    </div>
                  ))}
                  {student.groups.length > 2 && (
                    <div className="flex items-center bg-black-soft px-2 py-1 rounded-full border border-border">
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">+{student.groups.length - 2} more</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full", student.isActive ? "bg-status-success animate-pulse" : "bg-muted-foreground")} />
                  <span className="text-muted-foreground">{student.lastActive}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays size={14} className="text-primary-light" />
                  <span>{student.totalMeetings} meetings</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Activity size={14} className={cn(student.avgEngagement >= 85 ? "text-status-success" : student.avgEngagement >= 70 ? "text-status-warning" : "text-destructive")} />
                  <span className={cn(student.avgEngagement >= 85 ? "text-status-success" : student.avgEngagement >= 70 ? "text-status-warning" : "text-destructive")}>
                    {student.avgEngagement}%
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
        {/* Mobile Pagination */}
        <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-border">
          <div className="text-center text-sm font-medium text-muted-foreground">
            Page {safePage} of {totalPages}
          </div>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-9 w-9 shrink-0 rounded-medium"
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] sm:max-w-[180px] scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button 
                  key={idx}
                  variant={safePage === idx + 1 ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-medium text-xs font-bold snap-start", 
                    safePage !== idx + 1 && "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-9 w-9 shrink-0 rounded-medium"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}