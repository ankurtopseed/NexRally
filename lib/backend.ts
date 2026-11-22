import { GalleryItem, Player, Ranking, Tournament } from "./types";

type BackendProfile = {
  first_name: string;
  last_name: string;
  mobile_number: string;
  organisation_name: string | null;
  city: string;
  state: string;
  photo_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  forehand_rubber: string | null;
  backhand_rubber: string | null;
  blade: string | null;
};

export type CurrentUser = { id: number; email: string; profile: BackendProfile | null };
export type BackendEvent = {
  id: number;
  name: string;
  description: string | null;
  venue: string | null;
  city: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
  tournament_categories: { name: string }[];
};
export type BackendRanking = {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  rank: number;
  ranking_points: number;
};
export type BackendPhotoGroup = {
  event_name: string;
  photos: { id: number; url: string; media_type: string }[];
};

export function imageUrl(url: string | null | undefined, baseUrl: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

export function mapPlayer(user: CurrentUser, baseUrl: string): Player {
  if (!user.profile) throw new Error("This account does not have a player profile.");
  return {
    ...user.profile,
    id: user.id,
    email: user.email,
    organization: user.profile.organisation_name,
    profile_photo_url: imageUrl(user.profile.photo_url, baseUrl),
  };
}

export function mapEvent(event: BackendEvent): Tournament {
  return {
    id: event.id,
    title: event.name,
    description: event.description,
    venue: event.venue,
    location: event.city,
    start_date: event.starts_at,
    end_date: event.ends_at,
    registration_status: event.status,
    event_categories: event.tournament_categories.map((category) => category.name),
  };
}

export function mapRanking(entry: BackendRanking, baseUrl: string): Ranking {
  return {
    rank: entry.rank,
    player_id: entry.id,
    player_name: [entry.first_name, entry.last_name].filter(Boolean).join(" "),
    profile_photo_url: imageUrl(entry.photo_url, baseUrl),
    points: entry.ranking_points,
  };
}

export function mapPhotos(groups: BackendPhotoGroup[], baseUrl: string): GalleryItem[] {
  return groups.flatMap((group) => group.photos
    .filter((photo) => photo.media_type === "image")
    .map((photo) => ({ id: photo.id, image_url: imageUrl(photo.url, baseUrl)!, title: group.event_name })));
}
