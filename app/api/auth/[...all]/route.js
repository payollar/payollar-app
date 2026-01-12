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

// Wrap handlers to add CORS headers and error handling
export async function GET(req, context) {
  try {
    const response = await handler.GET(req, context);
    const origin = req.headers.get("origin");
    
    // Log 500 errors for debugging
    if (response.status === 500) {
      const responseText = await response.clone().text();
      console.error("Better Auth GET returned 500:", responseText);
    }
    
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Better Auth GET error:", error);
    console.error("Error stack:", error.stack);
    const origin = req.headers.get("origin");
    const errorResponse = NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "An error occurred",
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          details: error.toString()
        })
      },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, origin);
  }
}

export async function POST(req, context) {
  try {
    const response = await handler.POST(req, context);
    const origin = req.headers.get("origin");
    
    // Log 500 errors for debugging
    if (response.status === 500) {
      const responseText = await response.clone().text();
      console.error("Better Auth POST returned 500:", responseText);
    }
    
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Better Auth POST error:", error);
    console.error("Error stack:", error.stack);
    const origin = req.headers.get("origin");
    const errorResponse = NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "An error occurred",
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          details: error.toString()
        })
      },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, origin);
  }
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
