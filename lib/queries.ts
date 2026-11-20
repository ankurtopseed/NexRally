import { useQuery } from "@tanstack/react-query";
import { authedRequest } from "@/lib/api";
import { normalizeList } from "@/lib/format";
import { GalleryItem, Player, Ranking, Tournament } from "@/lib/types";

export function usePlayer() {
  return useQuery({
    queryKey: ["player", "me"],
    queryFn: () => authedRequest<Player>("/api/v1/players/me"),
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => normalizeList(
      await authedRequest<Tournament[] | { items?: Tournament[]; results?: Tournament[] }>(
        "/api/v1/tournaments",
      ),
    ),
  });
}

export function useRankings() {
  return useQuery({
    queryKey: ["rankings"],
    queryFn: async () => normalizeList(
      await authedRequest<Ranking[] | { items?: Ranking[]; results?: Ranking[] }>(
        "/api/v1/rankings",
      ),
    ),
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => normalizeList(
      await authedRequest<GalleryItem[] | { items?: GalleryItem[]; results?: GalleryItem[] }>(
        "/api/v1/gallery",
      ),
    ),
  });
}
