"use client";

import { useState, useTransition } from "react";
import {
  AdminUser,
  UsersResponse,
  getUsersAction,
  updateUserRoleAction,
  deleteUserAction,
} from "@/src/features/dashboard-admin/actions/admin-actions";
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
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS = ["INSTRUCTOR", "STUDENT"] as const;

interface Props {
  initialData: UsersResponse;
}

export function AdminUsersClient({ initialData }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialData.data.users);
  const [totalPages, setTotalPages] = useState(initialData.data.pagination.totalPages);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [fetchPending, startFetch] = useTransition();
  const [mutatePending, startMutate] = useTransition();

  const refetch = (overrides?: { search?: string; role?: string; page?: number }) => {
    startFetch(async () => {
      const res = await getUsersAction({
        search: overrides?.search ?? search,
        role: (overrides?.role !== undefined ? overrides.role : roleFilter) || undefined,
        page: String(overrides?.page ?? page),
        limit: "20",
      });
      if (res?.data?.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    refetch({ search: val, page: 1 });
  };

  const handleRoleFilter = (val: string) => {
    const role = val === "all" ? "" : val;
    setRoleFilter(role);
    setPage(1);
    refetch({ role, page: 1 });
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    refetch({ page: next });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    if (!newRole) return;
    startMutate(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u)));
      }
    });
  };

  const handleDelete = (userId: string) => {
    startMutate(async () => {
      const res = await deleteUserAction(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    });
  };

  const pending = fetchPending || mutatePending;

  // Filter out any users with the ADMIN role so they don't show up in the table
  const displayedUsers = users.filter(user => user.role !== "ADMIN");

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <Select value={roleFilter || "all"} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-full sm:w-60 h-12 text-base">
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
      <div className="border border-border rounded-soft overflow-hidden bg-black-soft-subtle p-2">
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
                  Loading users...
                </TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              displayedUsers.map((user) => (
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
                            disabled={pending}
                            title="Delete user"
                          >
                            <Trash2 size={20} />
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. All data will be removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
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
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="lg"
            disabled={page <= 1 || pending}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-base font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="lg"
            disabled={page >= totalPages || pending}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}