import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { InvitationView } from "@/components/invitation/InvitationView";
import { PassSection } from "@/components/invitation/PassSection";

export const dynamic = "force-dynamic";

export default async function PersonalInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await db.getInvitationByToken(token);

  if (!invite) {
    notFound();
  }

  const guest = {
    token: invite.token,
    guestName: invite.guest_name,
    partySize: invite.party_size,
    usedAt: invite.used_at,
  };

  return (
    <InvitationView
      guest={guest}
      passSlot={
        <PassSection
          token={invite.token}
          guestName={invite.guest_name}
          partySize={invite.party_size}
          usedAt={invite.used_at}
        />
      }
    />
  );
}

