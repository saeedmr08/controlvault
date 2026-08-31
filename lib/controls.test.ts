import { describe, expect, it } from "vitest";

import { createControl, gapCount, review, submitEvidence, type Control } from "./controls";

const hash = "a".repeat(64);
const control = (): Control => ({
  id: "AC-2",
  title: "Access reviews",
  owner: "leah",
  status: "open",
  evidenceHash: null,
});

describe("ControlVault workflow", () => {
  it("rejects self-approval of evidence", () => {
    const submitted = submitEvidence(control(), hash);
    expect(() => review(submitted, "leah", true)).toThrow(/cannot accept/);
  });

  it("accepts a third-party review", () => {
    const submitted = submitEvidence(control(), hash);
    const accepted = review(submitted, "amira", true);
    expect(accepted.status).toBe("accepted");
    expect(gapCount([accepted])).toBe(0);
  });

  it("rejects a non-hash evidence payload", () => {
    expect(() => submitEvidence(control(), "screenshot.png")).toThrow(/SHA-256/);
  });

  it("creates an open control with a catalog id", () => {
    const created = createControl({ id: "lg-9", title: "Logging retention", owner: "Nia" });
    expect(created).toMatchObject({
      id: "LG-9",
      owner: "nia",
      status: "open",
      evidenceHash: null,
    });
  });
});
