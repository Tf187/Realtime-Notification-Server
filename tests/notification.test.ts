import { describe, expect, it } from "vitest";
import { notificationSchema } from "../src/notification.js";

describe("notificationSchema", () => {
  it("accepts a valid notification", () => {
    const result = notificationSchema.safeParse({
      target: "user:42",
      type: "invoice.ready",
      title: "Export complete",
      message: "Your export is ready."
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty target", () => {
    const result = notificationSchema.safeParse({
      target: "",
      type: "test",
      title: "Test",
      message: "Hello"
    });

    expect(result.success).toBe(false);
  });
});
