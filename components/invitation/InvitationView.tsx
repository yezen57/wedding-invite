import { InvitationShell } from "./InvitationShell";
import { Cover, CalendarSection, Countdown, Venue, Schedule, Closing } from "./Sections";
import { Rsvp } from "./Rsvp";

export type GuestInvite = {
  token: string;
  guestName: string | null;
  partySize: number;
  usedAt: string | null;
};

/**
 * Full invitation. Without `guest` it is the public version (no QR, no personal data).
 * `passSlot` is rendered as section 6 (entry pass) for personal invitations only.
 */
export function InvitationView({ guest, passSlot }: { guest?: GuestInvite; passSlot?: React.ReactNode }) {
  return (
    <InvitationShell>
      <Cover guestName={guest?.guestName} partySize={guest?.partySize} />
      <CalendarSection />
      <Countdown />
      <Venue />
      <Schedule />
      {guest && passSlot}
      <Rsvp defaultName={guest?.guestName ?? ""} token={guest?.token} />
      <Closing />
    </InvitationShell>
  );
}
