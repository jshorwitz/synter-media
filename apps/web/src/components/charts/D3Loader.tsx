"use client";
import Script from "next/script";
import React from "react";

export default function D3Loader() {
  return (
    <Script
      id="d3-cdn"
      src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"
      strategy="afterInteractive"
    />
  );
}
