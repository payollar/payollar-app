// app/api/portfolio/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// ✅ POST → Add new portfolio items
export async function POST(req) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json(); 
    // Expected: { files: [{ url, fileKey, fileType, name, size, description? }] }

    if (!body?.files?.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Find local user
    const user = await db.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save all portfolio items
    const created = await Promise.all(
      body.files.map((f) =>
        db.portfolio.create({
          data: {
            title: f.name || null,
            description: f.description || null,
            url: f.url, // ✅ use ufsUrl on frontend
            fileType: f.fileType || null,
            fileKey: f.fileKey || null,
            userId: user.id,
          },
        })
      )
    );

    return NextResponse.json(created);
  } catch (err) {
    console.error("POST /api/portfolio error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ GET → Fetch current doctor’s portfolio
export async function GET(req) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find local user
    const user = await db.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get portfolio items
    const items = await db.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/portfolio error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ DELETE → Remove a portfolio item
export async function DELETE(req) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const portfolio = await db.portfolio.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (portfolio.user.clerkUserId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.portfolio.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/portfolio error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
