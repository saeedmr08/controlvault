export type ControlStatus = "open" | "evidence_submitted" | "accepted" | "rejected";

export interface Control {
  id: string;
  title: "Access reviews" | "Backup restore" | "Vendor due diligence" | string;
  owner: string;
  status: ControlStatus;
  evidenceHash: string | null;
}

export function submitEvidence(control: Control, hash: string): Control {
  if (control.status !== "open" && control.status !== "rejected") {
    throw new Error("Evidence can only be submitted for open or rejected controls");
  }
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error("Evidence must be a SHA-256 hex digest, not the file itself");
  }
  return { ...control, status: "evidence_submitted", evidenceHash: hash };
}

export function review(control: Control, reviewer: string, accept: boolean): Control {
  if (reviewer === control.owner) {
    throw new Error("Owners cannot accept their own evidence");
  }
  if (control.status !== "evidence_submitted") {
    throw new Error("Only submitted evidence can be reviewed");
  }
  return {
    ...control,
    status: accept ? "accepted" : "rejected",
    evidenceHash: accept ? control.evidenceHash : null,
  };
}

export function gapCount(controls: Control[]): number {
  return controls.filter((control) => control.status !== "accepted").length;
}

const ID_RE = /^[A-Z]{1,4}-[A-Z0-9]{1,6}$/;

export function createControl(input: {
  id: string;
  title: string;
  owner: string;
}): Control {
  const id = input.id.trim().toUpperCase();
  const title = input.title.trim();
  const owner = input.owner.trim().toLowerCase();
  if (!ID_RE.test(id)) {
    throw new Error("Control id must look like AC-2 or DR-1");
  }
  if (title.length < 3) {
    throw new Error("Title must be at least 3 characters");
  }
  if (owner.length < 2) {
    throw new Error("Owner is required");
  }
  return { id, title, owner, status: "open", evidenceHash: null };
}
