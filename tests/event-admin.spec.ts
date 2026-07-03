import { createIdempotencyKey } from "../backend/shared/idempotency";
describe("event admin utilities", () => {
  it("creates stable idempotency keys", () => {
    const first = createIdempotencyKey({
      topic: "script.created",
      entityId: "00000000-0000-0000-0000-000000000000",
      action: "render",
    });
    const second = createIdempotencyKey({
      topic: "script.created",
      entityId: "00000000-0000-0000-0000-000000000000",
      action: "render",
    });
    expect(first).toEqual(second);
    expect(first.length).toBe(64);
  });
});
