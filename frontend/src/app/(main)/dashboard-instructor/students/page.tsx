import { Suspense } from "react";
import { StudentsList } from "@/src/features/dashboard-instructor/students/components/StudentsList";
const StudentsPage = () => {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      {}
      <div className="hidden sm:block">
        <h2 className="text-3xl font-bold tracking-tight">Students Overview</h2>
        <p className="text-muted-foreground mt-1">
          Monitor engagement and manage your enrolled students
        </p>
      </div>
      {}
      <Suspense fallback={<StudentsSkeleton />}>
        <StudentsList />
      </Suspense>
    </div>
  );
};
function StudentsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-black-soft-subtle border border-border animate-pulse rounded-soft p-3 sm:p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <div className="h-4 w-16 sm:w-24 bg-white-soft-muted rounded-medium shrink-0" />
              <div className="h-8 w-8 bg-white-soft-muted rounded-full shrink-0" />
            </div>
            <div className="h-8 w-16 bg-white-soft-muted rounded-medium mt-2 shrink-0" />
          </div>
        ))}
      </div>
      {}
      <div className="flex flex-col gap-4 mt-4">
        <div className="h-11 w-full sm:max-w-md bg-white-soft-muted animate-pulse rounded-soft" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-white-soft-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>
      {}
      <div className="w-full bg-black-soft-subtle border border-border rounded-soft overflow-hidden mt-2">
        {}
        <div className="hidden md:flex h-12 bg-black-soft-muted border-b border-border items-center px-5 gap-4">
           <div className="h-4 w-24 bg-white-soft-muted animate-pulse rounded-medium flex-1" />
           <div className="h-4 w-32 bg-white-soft-muted animate-pulse rounded-medium flex-1" />
           <div className="h-4 w-20 bg-white-soft-muted animate-pulse rounded-medium flex-1" />
           <div className="h-4 w-20 bg-white-soft-muted animate-pulse rounded-medium flex-1" />
           <div className="h-4 w-16 bg-white-soft-muted animate-pulse rounded-medium flex-1" />
           <div className="h-4 w-8 bg-white-soft-muted animate-pulse rounded-medium ml-auto" />
        </div>
        {}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col md:flex-row p-5 border-b border-border last:border-0 gap-4 md:items-center">
            <div className="flex items-center gap-4 md:flex-1">
              <div className="h-10 w-10 rounded-full bg-white-soft-muted animate-pulse shrink-0" />
              <div className="h-4 w-32 bg-white-soft-muted animate-pulse rounded-medium" />
            </div>
            <div className="hidden md:block h-4 w-40 bg-white-soft-muted animate-pulse rounded-medium md:flex-1" />
            <div className="hidden md:block h-6 w-24 bg-white-soft-muted animate-pulse rounded-full md:flex-1" />
            <div className="hidden md:block h-4 w-20 bg-white-soft-muted animate-pulse rounded-medium md:flex-1" />
            <div className="hidden md:block h-4 w-16 bg-white-soft-muted animate-pulse rounded-medium md:flex-1" />
            <div className="h-8 w-8 bg-white-soft-muted animate-pulse rounded-medium md:ml-auto absolute right-5 md:relative" />
          </div>
        ))}
      </div>
    </div>
  );
}
export default StudentsPage;