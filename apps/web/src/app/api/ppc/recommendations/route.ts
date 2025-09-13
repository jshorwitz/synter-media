import { NextResponse } from "next/server";
import { backendFetch } from "../_backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const types = searchParams.get("types") || "neg,pause,budget";
  const status = searchParams.get("status") || "proposed";
  const limit = searchParams.get("limit") || "50";

  const data = await backendFetch(
    `/recommendations?types=${encodeURIComponent(types)}&status=${encodeURIComponent(status)}&limit=${encodeURIComponent(limit)}`,
    { method: "GET" }
  );
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  // Generate recommendations
  const { searchParams } = new URL(request.url);
  const types = searchParams.get("types") || "neg,pause,budget";
  const force_refresh = searchParams.get("force_refresh") || "false";

  const data = await backendFetch(
    `/recommendations/generate?types=${encodeURIComponent(types)}&force_refresh=${encodeURIComponent(force_refresh)}`,
    { method: "POST" }
  );
  return NextResponse.json(data);
}
