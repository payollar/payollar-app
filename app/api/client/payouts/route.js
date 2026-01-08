import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
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

    // Get appointments with payment info (for escrow)
    const appointments = await db.appointment.findMany({
      where: {
        clientId: user.id,
      },
      include: {
        creator: {
          select: {
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const totalSpent = transactions
      .filter((t) => t.type === "CREDIT_PURCHASE")
      .reduce((sum, t) => sum + Math.abs(t.amount) * 10, 0); // Assuming 10 per credit

    const escrowPayments = appointments
      .filter((a) => a.status === "SCHEDULED")
      .map((appointment) => ({
        id: appointment.id,
        title: `Appointment with ${appointment.creator.name}`,
        amount: 10, // 1 credit = 10
        recipientName: appointment.creator.name,
        status: "IN_ESCROW",
        paymentReference: appointment.id,
        description: appointment.creator.specialty || "Service appointment",
        createdAt: appointment.createdAt,
      }));

    const inEscrow = escrowPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = appointments
      .filter((a) => a.status === "COMPLETED")
      .length * 10; // Assuming 10 per completed appointment
    const pendingPayments = appointments
      .filter((a) => a.status === "SCHEDULED")
      .length * 10;

    // Format transactions
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Math.abs(t.amount) * 10,
      description:
        t.type === "CREDIT_PURCHASE"
          ? "Credit Purchase"
          : t.type === "APPOINTMENT_DEDUCTION"
          ? "Appointment Booking"
          : "Transaction",
      status: "COMPLETED",
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      escrowPayments,
      stats: {
        totalSpent,
        pendingPayments,
        completedPayments,
        inEscrow,
      },
    });
  } catch (error) {
    console.error("Error fetching client payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout data", transactions: [], escrowPayments: [], stats: {} },
      { status: 500 }
    );
  }
}
