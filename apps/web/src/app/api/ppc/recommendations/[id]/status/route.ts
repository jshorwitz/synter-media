import { NextResponse } from "next/server";
import { backendFetch } from "../../../_backend";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  if (!status) {
    return NextResponse.json(
      { error: "Missing status query param" },
      { status: 400 }
    );
  }

  const data = await backendFetch(
    `/recommendations/${encodeURIComponent(params.id)}/status?status=${encodeURIComponent(status)}`,
    { method: "PUT" }
  );
  return NextResponse.json(data);
}
