import { describe, expect, it } from "@jest/globals";
import { formatDateLabel, normalizeList } from "../lib/format";

describe("formatDateLabel", () => {
  it("uses a clear placeholder for missing or invalid dates", () => {
    expect(formatDateLabel()).toBe("DATE TO BE ANNOUNCED");
    expect(formatDateLabel("not-a-date")).toBe("DATE TO BE ANNOUNCED");
  });

  it("formats valid event dates for display", () => {
    expect(formatDateLabel("2026-03-16")).toContain("2026");
    expect(formatDateLabel("2026-03-16")).toMatch(/[A-Z]{3}/);
  });
});

describe("normalizeList", () => {
  it("accepts an array response", () => {
    expect(normalizeList([1, 2])).toEqual([1, 2]);
  });

  it("accepts common paginated response shapes", () => {
    expect(normalizeList({ items: [1] })).toEqual([1]);
    expect(normalizeList({ results: [2] })).toEqual([2]);
    expect(normalizeList({})).toEqual([]);
    expect(normalizeList(undefined)).toEqual([]);
  });
});
