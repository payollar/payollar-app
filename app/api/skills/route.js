import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId"); // optional

    let user;

    if (doctorId) {
      // fetch skills for any doctor by clerkUserId
      user = await db.user.findUnique({
        where: { clerkUserId: doctorId },
        include: { skills: true },
      });
    } else {
      // fetch skills for logged-in user
      const { userId } = getAuth(req);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: { skills: true },
      });
    }

    return NextResponse.json(user?.skills || []);
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // 1. Lookup the user by clerkUserId
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Create the skill linked to User.id
    const skill = await db.skill.create({
      data: {
        name,
        userId: user.id,  // ✅ correct way
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("POST /api/skills error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



// ✅ DELETE handler
export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("id"); // e.g. /api/skills?id=123

    if (!skillId) {
      return NextResponse.json({ error: "Missing skill ID" }, { status: 400 });
    }

    // Make sure the skill belongs to the logged-in user
    const skill = await db.skill.findUnique({
      where: { id: skillId },
      include: { user: true },
    });

    if (!skill || skill.user.clerkUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.skill.delete({ where: { id: skillId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/skills error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
