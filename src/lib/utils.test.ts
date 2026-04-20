import { cn } from "./utils";

describe("lib/utils cn", () => {
  it("merges truthy class values", () => {
    expect(cn("base", undefined, "active")).toBe("base active");
  });

  it("resolves tailwind conflicts using tailwind-merge", () => {
    expect(cn("p-2", "p-4", "text-sm", "text-lg")).toBe("p-4 text-lg");
  });
});
