import { notFound } from "next/navigation";
import { StageGate } from "@/features/game/components/StageGate";
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
    <main className="min-h-dvh bg-black flex items-center justify-center">
      <div
        className="aspect-video"
        style={{ width: "min(100vw, calc(100vh * 16 / 9))" }}
      >
        <StageGate stage={stage} />
      </div>
    </main>
  );
}
