import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { getArtistTracks } from "@/services/deezer";

export const GET = withLogging(async (req: NextRequest) => {
  const artist = req.nextUrl.searchParams.get("artist") ?? "";
  if (!artist) return NextResponse.json([]);
  const results = await getArtistTracks(artist);
  return NextResponse.json(results);
});
