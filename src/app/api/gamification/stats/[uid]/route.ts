import { NextRequest } from "next/server";
import { getUserGamification, getUserRank } from "@/lib/services/gamification";
import { apiError, apiOk } from "@/lib/utils/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;
    if (!uid) return apiError("User ID is required", 400);

    const [gamification, rank] = await Promise.all([
      getUserGamification(uid),
      getUserRank(uid),
    ]);

    if (!gamification) return apiError("User gamification data not found", 404);

    return apiOk({ gamification, rank });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return apiError("Failed to fetch user stats", 500);
  }
}
