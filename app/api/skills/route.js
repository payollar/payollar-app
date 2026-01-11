import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId"); // optional

    let user;

    if (doctorId) {
      // fetch skills for any doctor by ID
      user = await db.user.findUnique({
        where: { id: doctorId },
        include: { skills: true },
      });
    } else {
      // fetch skills for logged-in user
      const headersList = await headers();
      const session = await betterAuth.api.getSession({
        headers: headersList,
      });
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      user = await db.user.findUnique({
        where: { id: session.user.id }, // Better Auth uses User.id directly
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
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // 1. Lookup the user by ID (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Create the skill linked to User.id
    const skill = await db.skill.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("POST /api/skills error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE handler
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
    const skillId = searchParams.get("id");

    if (!skillId) {
      return NextResponse.json({ error: "Missing skill ID" }, { status: 400 });
    }

    // Get current user (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Make sure the skill belongs to the logged-in user
    const skill = await db.skill.findUnique({
      where: { id: skillId },
      include: { user: true },
    });

    if (!skill || skill.user.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.skill.delete({ where: { id: skillId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/skills error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
