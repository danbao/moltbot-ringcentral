import { describe, expect, it } from "vitest";
import { redactSensitive } from "./monitor.js";

describe("redactSensitive", () => {
  it("redacts sensitive keys in flat object", () => {
    const input = { text: "secret", name: "John", other: "ok" };
    expect(redactSensitive(input)).toEqual({ text: "[REDACTED]", name: "[REDACTED]", other: "ok" });
  });

  it("redacts sensitive keys in nested object", () => {
    const input = { user: { firstName: "Jane", lastName: "Doe", id: "123" } };
    expect(redactSensitive(input)).toEqual({ user: { firstName: "[REDACTED]", lastName: "[REDACTED]", id: "123" } });
  });

  it("redacts sensitive keys in arrays", () => {
    const input = [{ email: "test@example.com" }, { id: "456" }];
    expect(redactSensitive(input)).toEqual([{ email: "[REDACTED]" }, { id: "456" }]);
  });

  it("handles circular references", () => {
    const input: any = { id: "1" };
    input.self = input;
    const result = redactSensitive(input);
    expect(result.id).toBe("1");
    expect(result.self).toBe("[Circular]");
  });

  it("handles null and undefined", () => {
    expect(redactSensitive(null)).toBeNull();
    expect(redactSensitive(undefined)).toBeUndefined();
  });

  it("handles case-insensitive keys", () => {
    const input = { FirstName: "John", Email: "john@example.com" };
    expect(redactSensitive(input)).toEqual({ FirstName: "[REDACTED]", Email: "[REDACTED]" });
  });
});
