import { Suspense } from "react";
import { AdminUsersClient } from "@/src/features/dashboard-admin/users/AdminUsersClient";
import { getUsersAction } from "@/src/features/dashboard-admin/actions/admin-actions";

async function AdminUsersLoader() {
  const initialData = await getUsersAction({ page: "1", limit: "20" });
  return <AdminUsersClient initialData={initialData} />;
}

export default function AdminUsersPage() {
  return (
    <div className="animate-page-entrance">
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