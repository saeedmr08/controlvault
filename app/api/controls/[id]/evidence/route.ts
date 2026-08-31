import { NextResponse } from "next/server";

import { submitEvidence } from "../../../../../lib/controls";
import { getControl, updateControl } from "../../../../../lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const control = getControl(id);
  if (!control) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }

  const body = (await request.json()) as { hash?: string };
  if (!body.hash || typeof body.hash !== "string") {
    return NextResponse.json({ error: "hash is required" }, { status: 400 });
  }

  try {
    const updated = updateControl(id, submitEvidence(control, body.hash));
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evidence rejected" },
      { status: 400 },
    );
  }
}
