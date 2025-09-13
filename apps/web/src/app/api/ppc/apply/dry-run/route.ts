import { NextResponse } from "next/server";
import { backendFetch } from "../../_backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const ids: string[] = body?.ids || body?.recommendation_ids || [];
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "ids (array) is required" },
      { status: 400 }
    );
  }

  const data = await backendFetch(`/apply/dry_run_all`, {
    method: "POST",
    body: JSON.stringify(ids),
  });
  return NextResponse.json(data);
}
