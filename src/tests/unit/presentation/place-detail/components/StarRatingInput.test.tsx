import { fireEvent, render, screen } from "@testing-library/react";
import { StarRatingInput } from "@/features/place-detail/components/StarRatingInput";

describe("StarRatingInput", () => {
  it("selects rating on click", () => {
    const onRateMock = jest.fn();

    render(<StarRatingInput rating={3} onRate={onRateMock} />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 5 out of 5" }));

    expect(onRateMock).toHaveBeenCalledWith(5);
  });

  it("supports keyboard navigation", () => {
    const onRateMock = jest.fn();

    render(<StarRatingInput rating={3} onRate={onRateMock} />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Rate 3 out of 5" }), {
      key: "ArrowRight",
    });

    expect(onRateMock).toHaveBeenCalledWith(4);
  });

  it("does not emit changes when disabled", () => {
    const onRateMock = jest.fn();

    render(<StarRatingInput rating={2} onRate={onRateMock} disabled />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 4 out of 5" }));

    expect(onRateMock).not.toHaveBeenCalled();
  });
});
