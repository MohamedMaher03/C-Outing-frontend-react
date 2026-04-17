import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("UI Button", () => {
  it("renders as native button by default", () => {
    render(<Button>Click</Button>);

    expect(screen.getByRole("button", { name: "Click" }).tagName).toBe(
      "BUTTON",
    );
  });

  it("supports asChild rendering", () => {
    render(
      <Button asChild>
        <a href="/profile">Go to profile</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Go to profile" });
    expect(link).toHaveAttribute("href", "/profile");
  });
});
