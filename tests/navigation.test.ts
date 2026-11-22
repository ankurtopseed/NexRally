import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { router } from "expo-router";
import { goBackOrReplace } from "../lib/navigation";

jest.mock("expo-router", () => ({
  router: { canGoBack: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

beforeEach(() => { jest.clearAllMocks(); });

describe("goBackOrReplace", () => {
  it("goes back when there is a previous screen", () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    goBackOrReplace("/(tabs)/home");
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("opens the fallback when the screen is the first route", () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);
    goBackOrReplace("/(tabs)/home");
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
    expect(router.back).not.toHaveBeenCalled();
  });
});
