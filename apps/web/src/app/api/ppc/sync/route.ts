import { NextResponse } from "next/server";
import { backendFetch } from "../_backend";

export async function POST() {
  const data = await backendFetch(`/sync/full_sync`, { method: "POST" });
  return NextResponse.json(data);
}
