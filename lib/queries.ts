import { useQuery } from "@tanstack/react-query";
import { apiRequest, authedRequest, getApiBaseUrl, optionallyAuthedRequest } from "@/lib/api";
import { BackendEvent, BackendPhotoGroup, BackendRanking, CurrentUser, imageUrl, mapEvent, mapPhotos, mapPlayer, mapRanking } from "@/lib/backend";
import { LeagueStats, SiteSettings, Sponsor } from "@/lib/types";

export async function fetchPlayer() {
  return mapPlayer(await authedRequest<CurrentUser>("/api/auth/me"), getApiBaseUrl());
}

export async function fetchTournaments() {
  return (await optionallyAuthedRequest<BackendEvent[]>("/api/events?limit=200")).map(mapEvent);
}

export function usePlayer(enabled = true) {
  return useQuery({ queryKey: ["player", "me"], queryFn: fetchPlayer, enabled });
}

export function useTournaments() {
  return useQuery({ queryKey: ["tournaments"], queryFn: fetchTournaments });
}

export function useRankings() {
  return useQuery({
    queryKey: ["rankings"],
    queryFn: async () => (await apiRequest<BackendRanking[]>("/api/rankings")).map((item) => mapRanking(item, getApiBaseUrl())),
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => mapPhotos(await optionallyAuthedRequest<BackendPhotoGroup[]>("/api/public/photos"), getApiBaseUrl()),
  });
}

export function useLeagueStats() {
  return useQuery({ queryKey: ["league-stats"], queryFn: () => apiRequest<LeagueStats>("/api/public/stats") });
}

export function useSiteSettings() {
  return useQuery({ queryKey: ["site-settings"], queryFn: () => apiRequest<SiteSettings>("/api/public/settings") });
}

export function useSponsors() {
  return useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => (await apiRequest<Sponsor[]>("/api/public/sponsors")).map((item) => ({
      ...item, image_url: imageUrl(item.image_url, getApiBaseUrl()),
    })),
  });
}
