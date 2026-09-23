import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { getSimilarTracks } from "@/services/lastfm";

export const GET = withLogging(async (req: NextRequest) => {
  const artist = req.nextUrl.searchParams.get("artist") ?? "";
  const track = req.nextUrl.searchParams.get("track") ?? "";
  if (!artist || !track) return NextResponse.json([]);
  const results = await getSimilarTracks(artist, track);
  return NextResponse.json(results);
});
