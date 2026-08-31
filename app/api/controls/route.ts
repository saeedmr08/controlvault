import { NextResponse } from "next/server";

import { createControl, gapCount } from "../../../lib/controls";
import { addControl, listControls } from "../../../lib/store";

export async function GET() {
  const controls = listControls();
  return NextResponse.json({ data: controls, gapCount: gapCount(controls) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    title?: string;
    owner?: string;
  };
  try {
    const created = addControl(
      createControl({
        id: body.id ?? "",
        title: body.title ?? "",
        owner: body.owner ?? "",
      }),
    );
    const controls = listControls();
    return NextResponse.json({ data: created, gapCount: gapCount(controls) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 400 },
    );
  }
}
