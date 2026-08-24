import { MeetingDetailsPage } from "@/features/meeting-details/meeting-details-page";
import { PlayerProvider } from "@/context/player-context";

export default async function MeetingRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PlayerProvider>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <MeetingDetailsPage id={id} />
      </main>
    </PlayerProvider>
  );
}
