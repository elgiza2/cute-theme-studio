import { describe, expect, it } from "vitest";
import { inferRequestedSlideCount } from "./generateOutline";

describe("inferRequestedSlideCount", () => {
  it.each([
    ["Create 6 slides about renewable energy", 6],
    ["Build a 12-slide deck about onboarding", 12],
    ["Make slides about pricing, 8 slides", 8],
  ])("extracts %s", (prompt, expected) => {
    expect(inferRequestedSlideCount(prompt)).toBe(expected);
  });

  it.each([
    "Create slides about history",
    "Create 1 slide about history",
    "Create 31 slides about history",
    "Create 6 images about history",
  ])("returns undefined for unsupported request: %s", (prompt) => {
    expect(inferRequestedSlideCount(prompt)).toBeUndefined();
  });
});
