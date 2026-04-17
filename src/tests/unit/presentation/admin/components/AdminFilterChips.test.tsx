import { fireEvent, render, screen } from "@testing-library/react";
import AdminFilterChips from "@/features/admin/components/AdminFilterChips";

describe("AdminFilterChips", () => {
  it("renders options and updates selected value", () => {
    const onChangeMock = jest.fn();

    render(
      <AdminFilterChips
        label="Role"
        value="all"
        onChange={onChangeMock}
        options={[
          { value: "all", label: "All" },
          { value: "admin", label: "Admin" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Admin" }));

    expect(onChangeMock).toHaveBeenCalledWith("admin");
  });

  it("marks selected option with aria-pressed", () => {
    render(
      <AdminFilterChips
        value="admin"
        onChange={jest.fn()}
        options={[
          { value: "all", label: "All" },
          { value: "admin", label: "Admin" },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Admin" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
