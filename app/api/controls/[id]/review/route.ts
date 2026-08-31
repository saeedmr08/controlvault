import { NextResponse } from "next/server";

import { review } from "../../../../../lib/controls";
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

  const body = (await request.json()) as { reviewer?: string; accept?: boolean };
  if (!body.reviewer || typeof body.reviewer !== "string") {
    return NextResponse.json({ error: "reviewer is required" }, { status: 400 });
  }
  if (typeof body.accept !== "boolean") {
    return NextResponse.json({ error: "accept must be a boolean" }, { status: 400 });
  }

  try {
    const updated = updateControl(id, review(control, body.reviewer, body.accept));
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review rejected" },
      { status: 400 },
    );
  }
}
