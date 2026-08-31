import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type Control } from "./controls";

const DATA_FILE = path.join(process.cwd(), "data", "controls.json");

const seed: Control[] = [
  {
    id: "AC-2",
    title: "Access reviews",
    owner: "leah",
    status: "open",
    evidenceHash: null,
  },
  {
    id: "DR-1",
    title: "Backup restore",
    owner: "theo",
    status: "open",
    evidenceHash: null,
  },
  {
    id: "VD-4",
    title: "Vendor due diligence",
    owner: "amira",
    status: "open",
    evidenceHash: null,
  },
];

export function listControls(): Control[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as Control[];
  } catch {
    mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, `${JSON.stringify(seed, null, 2)}\n`);
    return seed.map((control) => ({ ...control }));
  }
}

export function saveControls(controls: Control[]): void {
  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, `${JSON.stringify(controls, null, 2)}\n`);
}

export function getControl(id: string): Control | undefined {
  return listControls().find((control) => control.id === id);
}

export function updateControl(id: string, next: Control): Control {
  const controls = listControls();
  const index = controls.findIndex((control) => control.id === id);
  if (index < 0) {
    throw new Error("Control not found");
  }
  controls[index] = next;
  saveControls(controls);
  return next;
}

export function addControl(control: Control): Control {
  const controls = listControls();
  if (controls.some((row) => row.id === control.id)) {
    throw new Error("Control id already exists");
  }
  controls.push(control);
  saveControls(controls);
  return control;
}
