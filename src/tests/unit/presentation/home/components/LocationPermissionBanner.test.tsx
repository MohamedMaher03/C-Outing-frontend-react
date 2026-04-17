import { fireEvent, render, screen } from "@testing-library/react";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("LocationPermissionBanner", () => {
  it("does not render for idle status", () => {
    const { container } = render(
      <LocationPermissionBanner
        userLocation={{
          status: "idle",
          coordinates: null,
          message: null,
          errorCode: null,
          requestLocation: jest.fn(),
        }}
        onEnableLocation={jest.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders denied state and triggers enable callback", () => {
    const enableLocationMock = jest.fn();

    render(
      <LocationPermissionBanner
        userLocation={{
          status: "denied",
          coordinates: null,
          message: "denied",
          errorCode: 1,
          requestLocation: jest.fn(),
        }}
        onEnableLocation={enableLocationMock}
      />,
    );

    const button = screen.getByRole("button", {
      name: "home.location.denied.title. home.location.denied.description",
    });

    fireEvent.click(button);

    expect(screen.getByText("home.location.denied.title")).toBeInTheDocument();
    expect(enableLocationMock).toHaveBeenCalledTimes(1);
  });
});
