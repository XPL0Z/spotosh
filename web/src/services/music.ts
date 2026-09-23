"use server";

import { currentUser } from "@/services/auth";
import type { HistoryItem } from "@/types/music";

const MUSIC_SERVER_URL = process.env.MUSIC_SERVER_URL ?? "http://localhost:4000";

// Tells the music server who triggered the call, for its logs
const userHeaders = async () => ({ "X-User": encodeURIComponent(await currentUser()) });

type AddToQueueInput = {
  trackId: number;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
};

export const sendControl = async ({ action, value }: { action: string; value?: number }) => {
  await fetch(`${MUSIC_SERVER_URL}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await userHeaders()) },
    body: JSON.stringify({ action, value }),
  });
};

export const addToQueue = async (input: AddToQueueInput) => {
  await fetch(`${MUSIC_SERVER_URL}/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await userHeaders()) },
    body: JSON.stringify(input),
  });
};

export const reorderQueue = async (ids: string[]) => {
  await fetch(`${MUSIC_SERVER_URL}/queue/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await userHeaders()) },
    body: JSON.stringify({ ids }),
  });
};

export const removeFromQueue = async (id: string) => {
  await fetch(`${MUSIC_SERVER_URL}/queue/${id}`, {
    method: "DELETE",
    headers: await userHeaders(),
  });
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const res = await fetch(`${MUSIC_SERVER_URL}/history`, {
      cache: "no-store",
      headers: await userHeaders(),
    });
    return res.json() as Promise<HistoryItem[]>;
  } catch {
    return [];
  }
};

export const removeFromHistory = async (id: string) => {
  await fetch(`${MUSIC_SERVER_URL}/history/${id}`, {
    method: "DELETE",
    headers: await userHeaders(),
  });
};
