import { NextResponse } from "next/server";
import { backendFetch } from "../../_backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  const action = searchParams.get("action");
  const result = searchParams.get("result");
  const user = searchParams.get("user");
  const limit = searchParams.get("limit") || "100";
  const offset = searchParams.get("offset") || "0";

  const qs = new URLSearchParams();
  if (since) qs.set("since", since);
  if (action) qs.set("action", action);
  if (result) qs.set("result", result);
  if (user) qs.set("user", user);
  qs.set("limit", limit);
  qs.set("offset", offset);

  const data = await backendFetch(`/audit?${qs.toString()}`);
  return NextResponse.json(data);
}
