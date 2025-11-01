import { describe, it, expect } from "vitest";
import { maskSensitiveString, maskPayloadForLLM, restoreRedactions } from "./index";

describe("maskSensitiveString", () => {
  it("replaces email and phone with placeholders", () => {
    const input = "聯絡我：alice@example.com 或 +886-912-345-678";
    const { masked, redactions } = maskSensitiveString(input);

    expect(masked).toContain("{{REDACTED_EMAIL_1}}");
    expect(masked).toContain("{{REDACTED_PHONE_1}}");
    expect(redactions).toHaveLength(2);
    expect(redactions[0].type).toBe("email");
    expect(redactions[1].type).toBe("phone");

    const restored = restoreRedactions(masked, redactions);
    expect(restored).toBe(input);
  });
});

describe("maskPayloadForLLM", () => {
  it("stringifies objects and masks nested fields", () => {
    const payload = {
      user: {
        email: "bob@example.com",
        phone: "+1 555 888 9999",
      },
      notes: "uuid 123e4567-e89b-12d3-a456-426614174000",
    };

    const { masked, redactions } = maskPayloadForLLM(payload);

    expect(redactions.map((r) => r.type).sort()).toEqual([
      "email",
      "phone",
      "uuid",
    ]);
    expect(masked).not.toContain("bob@example.com");
    expect(masked).not.toContain("+1 555 888 9999");
  });
});

