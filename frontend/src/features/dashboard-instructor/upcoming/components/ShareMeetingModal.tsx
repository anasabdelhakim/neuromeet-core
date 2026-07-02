"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Share2, Loader, CheckCircle2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-lg rounded-soft border bg-card backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground">
            <Share2 className="w-5 h-5 text-primary" />
            Share Meeting
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            Select a group to share "{meetingTitle}" with. All enrolled students will receive an email with the link and a new passcode.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center space-y-4 bg-status-success/10 border border-status-success/30 rounded-soft backdrop-blur-md shadow-inner animate-alert-entrance">
              <div className="w-16 h-16 bg-status-success/20 rounded-full flex items-center justify-center border border-status-success/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-8 h-8 text-status-success animate-bounce" />
              </div>
              <p className="text-base font-bold text-status-success tracking-wide">
                Invitations Sent Successfully!
              </p>
              {generatedPasscode && (
                <div className="bg-black-soft-muted border border-border rounded-medium p-4 w-full max-w-[240px] mt-4 shadow-medium">
                  <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-widest">Passcode</p>
                  <p className="text-2xl font-mono font-black tracking-[0.25em] text-primary select-all">{generatedPasscode}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 px-4 leading-relaxed font-medium">
                You can copy this passcode to manually invite someone outside of the group along with the Meeting Link.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <Label className="text-sm font-bold text-foreground mb-1 block tracking-wide">Select Target Group <span className="text-destructive">*</span></Label>
              <Select disabled={isLoading} value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-full !h-11 text-base px-4 bg-black-soft-muted border-border rounded-soft focus-visible:ring-primary shadow-inner">
                  <SelectValue placeholder="Select a group to share with">
                    {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} sideOffset={4} align="start" style={{ width: "var(--anchor-width)" }} className="rounded-soft bg-card border border-border shadow-2xl backdrop-blur-2xl w-[var(--anchor-width)]">
                  {groups.length === 0 && (
                    <SelectItem value="empty" disabled className="text-muted-foreground  py-3 px-4 font-medium">No groups available</SelectItem>
                  )}
                  {groups.map((g) => {
                    const studentCount = g._count?.enrollments || 0;
                    const isEmpty = studentCount === 0;
                    return (
                      <SelectItem key={g.id} value={g.id} disabled={isEmpty} className="py-2 px-2 font-medium hover:bg-white/5 cursor-pointer rounded-medium transition-colors w-full">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-semibold text-foreground truncate pl-2">{g.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground text-xs font-medium">({studentCount} {studentCount === 1 ? 'student' : 'students'})</span>
                            {isEmpty && <span className="text-destructive text-xs font-semibold">(Empty group)</span>}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {error && (
                <div className="animate-alert-entrance pt-1">
                  <p className="text-destructive text-xs font-bold bg-destructive-soft rounded-medium py-2 px-3 text-center border border-destructive/20">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-border/50">
          {success ? (
            <Button onClick={onClose} variant="default" className="w-full sm:w-auto px-6 font-bold shadow-medium">Close</Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto font-bold rounded-medium">
                Cancel
              </Button>
              <Button type="button" onClick={handleShare} disabled={isLoading || !selectedGroupId} className="w-full sm:w-auto font-bold shadow-medium rounded-medium">
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
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
