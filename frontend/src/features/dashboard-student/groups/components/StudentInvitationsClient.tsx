"use client";

import { useTransition, useState } from "react";
import { acceptInvitationAction, rejectInvitationAction } from "../actions/student-groups-actions";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Loader, Check, X, User } from "lucide-react";

interface StudentInvitationsClientProps {
  invitations: any[];
}

export function StudentInvitationsClient({ invitations }: StudentInvitationsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<{ id: string, type: 'accept' | 'reject' } | null>(null);

  const handleAccept = (id: string) => {
    setLoadingAction({ id, type: 'accept' });
    startTransition(async () => {
      await acceptInvitationAction(id);
      setLoadingAction(null);
    });
  };

  const handleReject = (id: string) => {
    setLoadingAction({ id, type: 'reject' });
    startTransition(async () => {
      await rejectInvitationAction(id);
      setLoadingAction(null);
    });
  };

  if (invitations.length === 0) return null;

  return (
    <section className="mt-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Pending Invitations
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
            {invitations.length}
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invitations.map(inv => (
          <Card key={inv.id} className="bg-black-soft-subtle border-border rounded-soft p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg leading-tight">{inv.group.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <User size={14} className="mr-1.5" />
                  {inv.group.instructor.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Button 
                onClick={() => handleAccept(inv.id)} 
                disabled={isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9"
              >
                {isPending && loadingAction?.id === inv.id && loadingAction?.type === 'accept' ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Accept
              </Button>
              <Button 
                onClick={() => handleReject(inv.id)} 
                disabled={isPending}
                variant="destructive"
                className="flex-1 h-9"
              >
                {isPending && loadingAction?.id === inv.id && loadingAction?.type === 'reject' ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                Decline
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
