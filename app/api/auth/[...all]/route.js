import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Allowed origins for CORS
const allowedOrigins = [
  "https://payollar.com",
  "https://www.payollar.com",
  "http://localhost:3000",
];

// Helper to check if origin is allowed
function isOriginAllowed(origin) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

// Helper to add CORS headers
function addCorsHeaders(response, origin) {
  if (!isOriginAllowed(origin)) {
    return response;
  }
  
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Access-Control-Allow-Origin", origin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

// Wrap handlers to add CORS headers
export async function GET(req, context) {
  const response = await handler.GET(req, context);
  const origin = req.headers.get("origin");
  return addCorsHeaders(response, origin);
}

export async function POST(req, context) {
  const response = await handler.POST(req, context);
  const origin = req.headers.get("origin");
  return addCorsHeaders(response, origin);
}

// Handle OPTIONS preflight requests
export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  
  if (isOriginAllowed(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  return new NextResponse(null, { status: 200 });
}
