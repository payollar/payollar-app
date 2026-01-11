import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await checkUser();
    
    if (!user) {
      return NextResponse.json({ role: null }, { status: 200 });
    }
    
    return NextResponse.json({
      role: user.role,
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { error: "Failed to check user role" },
      { status: 500 }
    );
  }
}
