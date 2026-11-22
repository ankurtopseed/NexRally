export type Player = {
  id?: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  mobile_number?: string;
  profile_photo_url?: string | null;
  city?: string | null;
  state?: string | null;
  organization?: string | null;
  playing_hand?: "right" | "left" | string;
  player_category?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  forehand_rubber?: string | null;
  backhand_rubber?: string | null;
  blade?: string | null;
  stats?: PlayerStats;
};

export type Tournament = {
  id: string | number;
  title: string;
  venue?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_deadline?: string | null;
  registration_status?: string | null;
  image_url?: string | null;
  description?: string | null;
  event_categories?: string[];
  rules?: string | null;
  registration_fee?: string | number | null;
  eligibility?: string | null;
};

export type Ranking = {
  rank: number;
  player_id?: string | number;
  player_name: string;
  profile_photo_url?: string | null;
  points: number;
};

export type GalleryItem = {
  id: string | number;
  image_url: string;
  title?: string | null;
  caption?: string | null;
};

export type PlayerStats = {
  tournaments_played?: number;
  matches_won?: number;
  current_ranking?: number;
  ranking_points?: number;
};
