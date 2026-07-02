import { getPendingInvitationsAction } from "../actions/student-groups-actions";
import { StudentInvitationsClient } from "./StudentInvitationsClient";

export async function StudentInvitationsList() {
  const res = await getPendingInvitationsAction();
  const invitations = res.success && res.data ? res.data : [];

  if (invitations.length === 0) return null;

  return <StudentInvitationsClient invitations={invitations} />;
}
