import { describe, expect, it } from "@jest/globals";
import { imageUrl, mapEvent, mapPhotos, mapPlayer, mapRanking } from "../lib/backend";

const origin = "https://api.ttcl.co.in";

describe("deployed backend mappings", () => {
  it("maps the current user profile and resolves relative images", () => {
    expect(mapPlayer({
      id: 7, email: "player@example.com",
      profile: {
        first_name: "A", last_name: "Player", mobile_number: "12345678",
        organisation_name: "Club", city: "Indore", state: "MP", photo_url: "/uploads/photo.jpg",
        date_of_birth: null, gender: null, forehand_rubber: null, backhand_rubber: null, blade: null,
      },
    }, origin)).toMatchObject({
      id: 7, email: "player@example.com", organization: "Club", profile_photo_url: `${origin}/uploads/photo.jpg`,
    });
    expect(() => mapPlayer({ id: 1, email: "test@example.com", profile: null }, origin)).toThrow("player profile");
  });

  it("maps event fields and categories", () => {
    expect(mapEvent({
      id: 1, name: "TTCL", description: null, venue: "Hall", city: "Indore",
      starts_at: "2026-11-18T15:27:00Z", ends_at: null, status: "completed",
      tournament_categories: [{ name: "Singles" }],
    })).toMatchObject({ title: "TTCL", start_date: "2026-11-18T15:27:00Z", registration_status: "completed", event_categories: ["Singles"] });
  });

  it("maps rankings and flattens only gallery images", () => {
    expect(mapRanking({ id: 3, first_name: "A", last_name: "B", rank: 1, ranking_points: 45, photo_url: null }, origin))
      .toMatchObject({ player_id: 3, player_name: "A B", rank: 1, points: 45 });
    expect(mapPhotos([{ event_name: "TTCL", photos: [
      { id: 1, url: "/uploads/a.jpg", media_type: "image" },
      { id: 2, url: "/uploads/a.mp4", media_type: "video" },
    ] }], origin)).toEqual([{ id: 1, image_url: `${origin}/uploads/a.jpg`, title: "TTCL" }]);
  });

  it("resolves backend upload paths with local development origins", () => {
    expect(imageUrl("/uploads/a.jpg", "http://localhost:8000")).toBe("http://localhost:8000/uploads/a.jpg");
    expect(imageUrl("https://images.ttcl.co.in/a.jpg", origin)).toBe("https://images.ttcl.co.in/a.jpg");
  });
});
