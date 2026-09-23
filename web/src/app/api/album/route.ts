import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { getAlbumTracks } from "@/services/deezer";

export const GET = withLogging(async (req: NextRequest) => {
  const album = req.nextUrl.searchParams.get("album") ?? "";
  const artist = req.nextUrl.searchParams.get("artist") ?? "";
  if (!album || !artist) return NextResponse.json([]);
  const results = await getAlbumTracks(album, artist);
  return NextResponse.json(results);
});
