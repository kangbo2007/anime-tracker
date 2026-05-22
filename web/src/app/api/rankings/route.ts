import { NextRequest, NextResponse } from "next/server";
import {
  calculateHeatRanking,
  calculateScoreRanking,
  calculateViewRanking,
  calculateRetentionRanking,
  calculateCharacterRanking,
} from "@/lib/rankings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "heat";

  let data;
  switch (type) {
    case "heat":
      data = await calculateHeatRanking();
      break;
    case "score":
      data = await calculateScoreRanking();
      break;
    case "view":
      data = await calculateViewRanking();
      break;
    case "retention":
      data = await calculateRetentionRanking();
      break;
    case "character":
      data = await calculateCharacterRanking();
      break;
    default:
      data = await calculateHeatRanking();
  }

  return NextResponse.json({
    type,
    updatedAt: new Date().toISOString(),
    items: data,
  });
}
