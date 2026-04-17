import { buildRegisterPayload } from "./registerPayload";

describe("auth register payload", () => {
  it("builds form data payload including avatar and date params", () => {
    const avatar = new File(["avatar"], "avatar.png", { type: "image/png" });

    const payload = buildRegisterPayload({
      name: "John Doe",
      email: "john@example.com",
      password: "Pass1234",
      phoneNumber: "+201234567890",
      dateOfBirth: "2000-01-01",
      avatar,
    });

    expect(payload.params.DateOfBirth).toBe("2000-01-01T00:00:00Z");
    expect(payload.formData.get("Name")).toBe("John Doe");
    expect(payload.formData.get("Email")).toBe("john@example.com");
    expect(payload.formData.get("PhoneNumber")).toBe("+201234567890");
    expect(payload.formData.get("Avatar")).toBe(avatar);
  });

  it("normalizes non-YYYY-MM-DD dates through Date ISO conversion", () => {
    const payload = buildRegisterPayload({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Pass1234",
      phoneNumber: "+201234567890",
      dateOfBirth: "2001-03-04T10:30:00.000Z",
    });

    expect(payload.params.DateOfBirth).toBe("2001-03-04T10:30:00.000Z");
    expect(payload.formData.get("Avatar")).toBeNull();
  });
});
