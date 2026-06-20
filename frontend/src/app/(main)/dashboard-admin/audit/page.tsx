import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";

export default function AdminAuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card variant="gradient" className="sm:py-6 sm:px-4 py-4 px-0 relative overflow-hidden">
        <CardContent className="relative z-10">
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter text-white-soft-muted">
            Audit Log
          </CardTitle>
          <CardDescription className="mt-2 text-base text-white-soft-subtle">
            Track all admin actions and system events
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="p-4 sm:p-5 bg-black-soft-subtle border border-border">
        <p className="text-sm text-muted-foreground">
          Audit logging will be implemented in a future phase. This page will display:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
          <li>Admin actions (user role changes, deletions)</li>
          <li>Authentication events (logins, logouts, failed attempts)</li>
          <li>System-level changes</li>
          <li>IP addresses and timestamps</li>
        </ul>
      </Card>
    </div>
  );
}