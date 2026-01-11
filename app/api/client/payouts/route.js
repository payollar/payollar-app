import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get credit transactions
    const transactions = await db.creditTransaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
