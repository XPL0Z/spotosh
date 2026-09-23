import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { getPlaylistTracks } from "@/services/deezer";

export const GET = withLogging(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  const playlistId = id ? parseInt(id, 10) : NaN;
  if (Number.isNaN(playlistId)) return NextResponse.json([]);
  const results = await getPlaylistTracks(playlistId);
  return NextResponse.json(results);
});
