"use client";

import { Loader2, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GenreChips } from "@/components/queue/genres";
import { QueueList } from "@/components/queue/list";
import { TrackRow } from "@/components/track/row";
import { Input } from "@/components/ui/input";
import { usePlayer } from "@/hooks/use-player";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useSearch } from "@/hooks/use-search";
import { addToQueue, getHistory, removeFromQueue } from "@/services/music";
import type { HistoryItem, Track } from "@/types/music";

export const HomePanel = () => {
  const state = usePlayer();
  const { query, results, searching, showResults, setShowResults, handleSearch, clearSearch } =
    useSearch();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const { recommendations, recsLoading, removeRecommendation, refresh, canRefresh } =
    useRecommendations({
      history,
      queue: state.queue,
      nowPlaying: state.nowPlaying,
    });
  const [genreLoadingId, setGenreLoadingId] = useState<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch history whenever the playing track changes
  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => {});
  }, [state.nowPlaying?.id]);

  const handleAdd = useCallback(
    async (track: Track) => {
      await addToQueue({
        trackId: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName ?? "",
        artwork: track.artworkUrl100 ?? "",
        durationMs: track.trackTimeMillis ?? 0,
      });
      clearSearch();
    },
    [clearSearch]
  );

  const handleRemoveFromQueue = useCallback((id: string) => removeFromQueue(id), []);

  const addGenreToQueue = useCallback(
    async (preset: { genreId?: number; playlistId?: number }) => {
      const id = preset.genreId ?? preset.playlistId;
      if (id == null || genreLoadingId != null) return;
      setGenreLoadingId(id);
      try {
        const url =
          preset.genreId != null
            ? `/api/genre?id=${preset.genreId}`
            : `/api/playlist?id=${preset.playlistId}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const tracks: Track[] = await res.json();
        await Promise.all(
          tracks.map((track) =>
            addToQueue({
              trackId: track.trackId,
              title: track.trackName,
              artist: track.artistName,
              album: track.collectionName ?? "",
              artwork: track.artworkUrl100 ?? "",
              durationMs: track.trackTimeMillis ?? 0,
            })
          )
        );
      } catch {
        /* silent */
      } finally {
        setGenreLoadingId(null);
      }
    },
    [genreLoadingId]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-3.5 border-b border-outline shrink-0">
        <div className="relative">
          <div className="relative flex items-center">
            <div className="absolute left-[13px] text-muted flex z-10">
              {searching ? (
                <Loader2 size={15} className="animate-spin-slow" />
              ) : (
                <Search size={15} />
              )}
            </div>
            <Input
              placeholder="Search catalog…"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className={showResults && results.length > 0 ? "border-accent" : ""}
            />
            {query && (
              <button
                type="button"
                onMouseDown={clearSearch}
                className="absolute right-[11px] bg-transparent border-none cursor-pointer text-muted flex"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-surface border border-outline rounded-[14px] overflow-hidden z-50 shadow-[0_24px_48px_rgba(0,0,0,0.75)] max-h-[340px] overflow-y-auto animate-fade-up">
              {results.map((track) => (
                <TrackRow key={track.trackId} track={track} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-3.5">
        <GenreChips
          onSelect={(preset) => addGenreToQueue(preset)}
          loadingId={genreLoadingId ?? undefined}
        />
        <QueueList state={state} onRemoveFromQueue={handleRemoveFromQueue} />

        {(recommendations.length > 0 || recsLoading || canRefresh || history.length > 0) && (
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline">
              <Sparkles size={13} className="text-muted" />
              <span className="text-[11px] font-bold text-muted tracking-[0.1em] uppercase">
                Recommended
              </span>
              {recsLoading && <Loader2 size={11} className="animate-spin-slow text-muted ml-1" />}
              <button
                type="button"
                onClick={refresh}
                disabled={!canRefresh || recsLoading}
                title="Refresh recommendations from Up Next"
                className="ml-auto w-[26px] h-[26px] flex items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <RefreshCw size={13} className={recsLoading ? "animate-spin-slow" : ""} />
              </button>
            </div>
            {recommendations.length > 0 && (
              <div className="flex flex-col gap-px">
                {recommendations.map((track) => (
                  <TrackRow
                    key={track.trackId}
                    track={track}
                    onAdd={handleAdd}
                    onRemove={removeRecommendation}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
