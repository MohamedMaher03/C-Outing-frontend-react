import { fireEvent, render, screen } from "@testing-library/react";
import { ProfilePreferenceOptionButton } from "@/features/profile/components/ProfilePreferenceOptionButton";

describe("ProfilePreferenceOptionButton", () => {
  it("renders selected option and handles click", () => {
    const onClickMock = jest.fn();

    render(
      <ProfilePreferenceOptionButton selected={true} onClick={onClickMock}>
        Budget
      </ProfilePreferenceOptionButton>,
    );

    const button = screen.getByRole("button", { name: "Budget" });
    expect(button).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it("renders unselected option", () => {
    render(
      <ProfilePreferenceOptionButton selected={false} onClick={jest.fn()}>
        District
      </ProfilePreferenceOptionButton>,
    );

    expect(screen.getByRole("button", { name: "District" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
