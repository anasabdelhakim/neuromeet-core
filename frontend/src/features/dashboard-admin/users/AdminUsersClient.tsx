"use client";

import { useState, useTransition } from "react";
import {
  AdminUser,
  UsersResponse,
  getUsersAction,
  updateUserRoleAction,
  deleteUserAction,
} from "@/src/features/dashboard-admin/actions/admin-actions";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
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
import { Search, Trash2, AlertTriangle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useReducer } from "react";

const ROLE_OPTIONS = ["INSTRUCTOR", "STUDENT"] as const;

type FilterState = { search: string; roleFilter: string; page: number };
type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_ROLE"; payload: string }
  | { type: "SET_PAGE"; payload: number };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };
    case "SET_ROLE":
      return { ...state, roleFilter: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

interface Props {
  initialData: UsersResponse;
}

export function AdminUsersClient({ initialData }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialData.data.users);
  const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
  const [{ search, roleFilter, page }, dispatch] = useReducer(filterReducer, {
    search: "",
    roleFilter: "",
    page: 1,
  });
  const [fetchPending, startFetch] = useTransition();
  const [mutatePending, startMutate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const refetch = (currentState: FilterState) => {
    startFetch(async () => {
      const res = await getUsersAction({
        search: currentState.search,
        role: currentState.roleFilter || undefined,
        page: String(currentState.page),
        limit: "5",
      });
      if (res?.data?.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refetch({ search, roleFilter, page });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, page]);

  const handleSearch = (val: string) => dispatch({ type: "SET_SEARCH", payload: val });

  const handleRoleFilter = (val: string | null) => {
    if (!val) return;
    const role = val === "all" ? "" : val;
    dispatch({ type: "SET_ROLE", payload: role });
  };

  const handlePageChange = (next: number) => {
    dispatch({ type: "SET_PAGE", payload: next });
  };

  const handleRoleChange = (userId: string, newRole: string | null) => {
    if (!newRole) return;
    startMutate(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: res.data!.role as any } : u)));
      } else {
        setAlertError(res.error || "Unknown error");
      }
    });
  };

  const handleDelete = (userId: string) => {
    setDeletingId(userId);
    startMutate(async () => {
      const res = await deleteUserAction(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
      setDeletingId(null);
    });
  };

  const pending = fetchPending || mutatePending;

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 h-13">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <Select value={roleFilter || "all"} onValueChange={handleRoleFilter} disabled={pending}>
          <SelectTrigger className="w-full sm:w-60 !h-12 text-base">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border max-sm:mt-12 rounded-soft overflow-hidden bg-black-soft-subtle flex flex-col">
        <div className="p-2 overflow-x-auto">
          <Table className="w-full min-w-max text-base">
          <TableHeader>
            <TableRow className="bg-black-soft hover:bg-black-soft">
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4">Email</TableHead>
              <TableHead className="py-4">Role</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4">Joined</TableHead>
              <TableHead className="py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={24} />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-black-soft transition-colors">
                  <TableCell className="font-medium py-5">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground py-5">{user.email}</TableCell>
                  <TableCell className="py-5">
                    <Select
                      value={user.role}
                      onValueChange={(val) => val && handleRoleChange(user.id, val)}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-10 w-40 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="py-5">
                    {user.active ? (
                      <Badge variant="outline" className="text-status-success border-status-success-border py-1 px-3">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive-soft-hover py-1 px-3">
                        Deleted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-5">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <div className="flex justify-end gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-10 w-10"
                            disabled={pending || deletingId === user.id}
                            title="Delete user"
                          >
                            {deletingId === user.id ? <Loader className="animate-spin" size={20} /> : <Trash2 size={20} />}
                          </Button>
                        } />
                        <AlertDialogContent className="border-destructive/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                              <AlertTriangle size={24} />
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-base mt-2">
                              This action will <strong>completely delete</strong> the user and all their associated data from the database. This action is permanent and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-11" disabled={pending || deletingId === user.id}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              variant="destructive" 
                              className="h-11 font-semibold" 
                              disabled={pending || deletingId === user.id} 
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(user.id);
                              }}
                            >
                              {deletingId === user.id ? (
                                <>
                                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                                </>
                              ) : (
                                "Delete Completely"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-black-soft-muted border-t border-border">
          <span className="text-sm text-muted-foreground font-medium">
            Page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong>
          </span>

          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || pending}
              className="h-8 px-3 rounded-medium border-border/50 text-xs"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] sm:max-w-[180px] scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button 
                  key={idx}
                  variant={page === idx + 1 ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => handlePageChange(idx + 1)}
                  disabled={pending}
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-medium text-xs font-bold snap-start", 
                    page !== idx + 1 && "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || pending}
              className="h-8 px-3 rounded-medium border-border/50 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      </div>

      {/* Error Alert Dialog */}
      <AlertDialog open={!!alertError} onOpenChange={(open) => !open && setAlertError(null)}>
        <AlertDialogContent className="border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={24} />
              Role Update Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Failed to change the user's role: <strong>{alertError}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertError(null)}>
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}