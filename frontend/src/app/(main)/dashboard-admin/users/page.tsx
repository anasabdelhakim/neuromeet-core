import { Suspense } from "react";
import { AdminUsersClient } from "@/src/features/dashboard-admin/users/AdminUsersClient";
import { getUsersAction } from "@/src/features/dashboard-admin/actions/admin-actions";

async function AdminUsersLoader() {
  const initialData = await getUsersAction({ page: "1", limit: "5" });
  return <AdminUsersClient initialData={initialData} />;
}

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      {/* Static Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage platform users and roles
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((id) => (
            <div
              key={id}
              className="w-full h-16 bg-custom-gray border border-border animate-pulse rounded-soft"
            />
          ))}
        </div>
      }
    >
      <AdminUsersLoader />
      </Suspense>
    </div>
  );
}