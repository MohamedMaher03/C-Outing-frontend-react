import { signUpSchema } from "./signUp.schema";

describe("signUpSchema", () => {
  const baseInput = {
    fullName: "Mohamed Ali",
    email: "mohamed@example.com",
    phone: "+201234567890",
    dateOfBirth: "2000-01-01",
    confirmPassword: "Pass1234!",
    avatar: undefined,
  };

  it("accepts passwords with a special character", () => {
    const result = signUpSchema.safeParse({
      ...baseInput,
      password: "Pass1234!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects passwords without a special character", () => {
    const result = signUpSchema.safeParse({
      ...baseInput,
      password: "Pass1234",
      confirmPassword: "Pass1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      );
    }
  });
});
