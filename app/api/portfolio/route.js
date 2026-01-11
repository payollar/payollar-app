// app/api/portfolio/route.js
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// POST → Add new portfolio items
export async function POST(req) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json(); 
    // Expected: { files: [{ url, fileKey, fileType, name, size, description? }] }

    if (!body?.files?.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Find local user (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio items
    const portfolioItems = await db.portfolio.createMany({
      data: body.files.map((file) => ({
        userId: user.id,
        url: file.url,
        fileKey: file.fileKey || null,
        fileType: file.fileType || null,
        title: file.name || null,
        description: file.description || null,
      })),
    });

    return NextResponse.json({ success: true, count: portfolioItems.count });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET → Fetch portfolio items for a user
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const portfolioItems = await db.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(portfolioItems);
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE → Remove a portfolio item
export async function DELETE(req) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get("id");

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID required" }, { status: 400 });
    }

    // Get current user (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the portfolio item belongs to the user
    const portfolioItem = await db.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolioItem || portfolioItem.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.portfolio.delete({ where: { id: portfolioId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/portfolio error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
