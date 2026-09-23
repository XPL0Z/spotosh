import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withLogging } from "@/lib/logger";
import { getGenreChartTracks } from "@/services/deezer";

export const GET = withLogging(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  const genreId = id ? parseInt(id, 10) : NaN;
  if (Number.isNaN(genreId)) return NextResponse.json([]);
  const results = await getGenreChartTracks(genreId);
  return NextResponse.json(results);
});
