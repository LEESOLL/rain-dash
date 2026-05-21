import { notFound } from "next/navigation";
import { GameCanvas } from "@/features/game/components/GameCanvas";
import { getStage } from "@/features/stage/stageRepository";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  const stage = getStage(stageId);

  if (!stage) {
    notFound();
  }

  return (
    <main className="h-dvh w-screen overflow-hidden bg-black">
      <GameCanvas stage={stage} />
    </main>
  );
}
