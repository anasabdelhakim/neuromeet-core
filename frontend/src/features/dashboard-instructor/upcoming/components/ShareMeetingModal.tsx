"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Share2, Loader2, CheckCircle2 } from "lucide-react";
import { shareMeetingAction } from "../../home/actions/meeting-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

interface ShareMeetingModalProps {
  meetingId: string;
  meetingTitle: string;
  groups: any[];
  isOpen: boolean;
  onClose: () => void;
}

export function ShareMeetingModal({ meetingId, meetingTitle, groups = [], isOpen, onClose }: ShareMeetingModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [generatedPasscode, setGeneratedPasscode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError("");
      setSelectedGroupId("");
      setGeneratedPasscode("");
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedGroupId) {
      setError("Please select a group to share with.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    const res = await shareMeetingAction(meetingId, selectedGroupId);
    
    if (res.success) {
      setSuccess(true);
      if (res.passcode) {
        setGeneratedPasscode(res.passcode);
      }
    } else {
      setError(res.errorMessage || "Failed to share meeting.");
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Meeting
          </DialogTitle>
          <DialogDescription>
            Select a group to share "{meetingTitle}" with. All enrolled students will receive an email with the link and a new passcode.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-status-success-soft border border-status-success-border rounded-lg">
              <CheckCircle2 className="w-10 h-10 text-status-success" />
              <p className="text-sm font-medium text-status-success mb-2">
                Invitations sent successfully!
              </p>
              {generatedPasscode && (
                <div className="bg-background/50 border border-status-success-border/50 rounded-md p-3 w-full max-w-[200px] mt-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Passcode</p>
                  <p className="text-xl font-mono font-bold tracking-[0.2em] text-foreground">{generatedPasscode}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 px-4 leading-relaxed">
                You can copy this passcode to manually invite someone outside of the group along with the Meeting Link.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-semibold mb-2 block">Select Group</Label>
              <Select disabled={isLoading} value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-full h-14 text-base px-4 bg-black-soft-muted border-border">
                  <SelectValue placeholder="Select a group to share with">
                    {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} sideOffset={4} align="start" className="w-full">
                  {groups.length === 0 && (
                    <SelectItem value="empty" disabled>No groups available</SelectItem>
                  )}
                  {groups.map((g) => {
                    const studentCount = g._count?.enrollments || 0;
                    const isEmpty = studentCount === 0;
                    return (
                      <SelectItem key={g.id} value={g.id} disabled={isEmpty}>
                        {g.name} ({studentCount} {studentCount === 1 ? 'student' : 'students'}) {isEmpty && " - Cannot share with empty group"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {error && <p className="text-xs text-status-error font-medium mt-1">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          {success ? (
            <Button onClick={onClose} variant="default">Close</Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleShare} disabled={isLoading || !selectedGroupId}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Now
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
