import { useQuery } from "@tanstack/react-query";
import { authedRequest, getApiBaseUrl } from "@/lib/api";
import { BackendEvent, BackendPhotoGroup, BackendRanking, CurrentUser, mapEvent, mapPhotos, mapPlayer, mapRanking } from "@/lib/backend";

export async function fetchPlayer() {
  return mapPlayer(await authedRequest<CurrentUser>("/api/auth/me"), getApiBaseUrl());
}

export async function fetchTournaments() {
  return (await authedRequest<BackendEvent[]>("/api/events?limit=200")).map(mapEvent);
}

export function usePlayer() {
  return useQuery({ queryKey: ["player", "me"], queryFn: fetchPlayer });
}

export function useTournaments() {
  return useQuery({ queryKey: ["tournaments"], queryFn: fetchTournaments });
}

export function useRankings() {
  return useQuery({
    queryKey: ["rankings"],
    queryFn: async () => (await authedRequest<BackendRanking[]>("/api/rankings")).map((item) => mapRanking(item, getApiBaseUrl())),
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => mapPhotos(await authedRequest<BackendPhotoGroup[]>("/api/public/photos"), getApiBaseUrl()),
  });
}
