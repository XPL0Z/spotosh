import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { searchTracks } from "@/services/deezer";

export const GET = withLogging(async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  const results = await searchTracks(q);
  return NextResponse.json(results);
});
