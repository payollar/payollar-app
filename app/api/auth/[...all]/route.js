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
  responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  responseHeaders.set("Access-Control-Expose-Headers", "Location, Set-Cookie");
  // Allow redirects for OAuth flows
  responseHeaders.set("Access-Control-Max-Age", "86400"); // 24 hours
  
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
    
    // Handle redirects for OAuth flows - preserve redirect location but add CORS headers
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location && isOriginAllowed(origin)) {
        const responseHeaders = new Headers();
        responseHeaders.set("Access-Control-Allow-Origin", origin);
        responseHeaders.set("Access-Control-Allow-Credentials", "true");
        responseHeaders.set("Location", location);
        responseHeaders.set("Access-Control-Expose-Headers", "Location");
        return new NextResponse(null, {
          status: response.status,
          headers: responseHeaders,
        });
      }
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Expose-Headers": "Location, Set-Cookie",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }
  
  return new NextResponse(null, { status: 200 });
}
