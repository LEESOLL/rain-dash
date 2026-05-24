import { notFound } from "next/navigation";
import { PlayViewport } from "@/features/game/components/PlayViewport";
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

  return <PlayViewport stage={stage} />;
}
