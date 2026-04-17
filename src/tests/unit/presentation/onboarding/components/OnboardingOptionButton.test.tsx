import { fireEvent, render, screen } from "@testing-library/react";
import { OnboardingOptionButton } from "@/features/onboarding/components/OnboardingOptionButton";

describe("OnboardingOptionButton", () => {
  it("renders selected state and responds to clicks", () => {
    const onClickMock = jest.fn();

    render(
      <OnboardingOptionButton selected={true} onClick={onClickMock}>
        Cafes
      </OnboardingOptionButton>,
    );

    const button = screen.getByRole("button", { name: "Cafes" });

    expect(button).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it("supports unselected state", () => {
    render(
      <OnboardingOptionButton selected={false} onClick={jest.fn()}>
        Nightlife
      </OnboardingOptionButton>,
    );

    expect(screen.getByRole("button", { name: "Nightlife" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
