import type { NextRequest } from "next/server";

const BASE_URL = process.env.PPC_BACKEND_URL || "http://localhost:8000";
const BASIC_USER = process.env.PPC_BACKEND_BASIC_USER || "admin";
const BASIC_PASS = process.env.PPC_BACKEND_BASIC_PASS || "change-me";

function basicAuthHeader(): string {
  const token = Buffer.from(`${BASIC_USER}:${BASIC_PASS}`).toString("base64");
  return `Basic ${token}`;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: basicAuthHeader(),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}
