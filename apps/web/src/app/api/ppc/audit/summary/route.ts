import { NextResponse } from "next/server";
import { backendFetch } from "../../_backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") || "30";
  const data = await backendFetch(`/audit/summary?days=${encodeURIComponent(days)}`);
  return NextResponse.json(data);
}
