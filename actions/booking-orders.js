"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

const person = { id: true, name: true, imageUrl: true, specialty: true };

function mapInvoice(invoice) {
  if (!invoice) return null;
  return {
    id: invoice.id,
    title: invoice.title,
    notes: invoice.notes || "",
    lineItems: Array.isArray(invoice.lineItems) ? invoice.lineItems : [],
    amount: Number(invoice.amount || 0),
    currency: invoice.currency || "GHS",
    status: invoice.status,
    createdAt: invoice.createdAt?.toISOString?.() || invoice.createdAt,
  };
}

function latestOpenInvoice(invoices = []) {
  return (
    invoices.find((invoice) => invoice.status === "SENT") ||
    invoices.find((invoice) => invoice.status === "PAID") ||
    null
  );
}

function resolveAppointmentCategory(row) {
  if (row.source === "CAMPAIGN") return "CAMPAIGN";
  if (row.source === "TALENT") {
    const brief = String(row.clientDescription || "");
    if (/^Campaign application:/i.test(brief.trim())) return "CAMPAIGN";
    return "TALENT";
  }
  const brief = String(row.clientDescription || "");
  if (/^Campaign application:/i.test(brief.trim())) return "CAMPAIGN";
  return "TALENT";
}

function campaignTitleFromBrief(brief) {
  const match = String(brief || "").match(/^Campaign application:\s*(.+)$/im);
  return match?.[1]?.trim() || null;
}

function shape(row, userId) {
  const other = row.creatorId === userId ? row.client : row.creator;
  const invoices = Array.isArray(row.invoices) ? row.invoices : [];
  const invoice = mapInvoice(latestOpenInvoice(invoices));
  const category = resolveAppointmentCategory(row);
  const campaignTitle = campaignTitleFromBrief(row.clientDescription);
  return {
    id: row.id,
    category,
    kind: "APPOINTMENT",
    href: null,
    status: row.status,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    brief: row.clientDescription?.trim() || "",
    notes: row.notes?.trim() || "",
    campaignTitle,
    agreedAmount: row.agreedAmount != null ? Number(row.agreedAmount) : null,
    invoice,
    hasOpenInvoice: Boolean(invoice && invoice.status === "SENT"),
    paymentRecorded: Boolean(
      (invoice && invoice.status === "PAID") ||
        (row.agreedAmount != null &&
          !invoices.some((item) => item.status === "SENT") &&
          ["SCHEDULED", "COMPLETED"].includes(row.status))
    ),
    other: {
      id: other?.id || "",
      name: other?.name || "Payollar user",
      imageUrl: other?.imageUrl || "",
      specialty: other?.specialty || "",
    },
  };
}

function mediaStatusToOrderStatus(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "REQUESTED";
    case "CONFIRMED":
      return "SCHEDULED";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "REQUESTED";
  }
}

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function shapeMediaBooking(booking) {
  const start =
    toIso(booking.startDate) ||
    toIso(booking.createdAt) ||
    new Date().toISOString();
  const end = toIso(booking.endDate) || start;
  const amount = Number(booking.totalAmount ?? booking.packagePrice ?? 0);
  const listingName = booking.listing?.name || booking.packageName || "Media booking";
  const agencyName = booking.agency?.agencyName || "Media agency";
  const typeLabel =
    booking.bookingType === "RATE_CARD"
      ? "Rate card"
      : booking.listing?.listingType || "Media";

  return {
    id: `media:${booking.id}`,
    category: "MEDIA",
    kind: booking.bookingType === "RATE_CARD" ? "RATE_CARD" : "MEDIA",
    href: "/client/media",
    status: mediaStatusToOrderStatus(booking.status),
    mediaStatus: booking.status,
    startTime: start,
    endTime: end,
    createdAt: toIso(booking.createdAt) || start,
    updatedAt: toIso(booking.updatedAt) || start,
    brief: [booking.packageName, typeLabel].filter(Boolean).join(" · "),
    notes: booking.notes?.trim() || "",
    campaignTitle: listingName,
    agreedAmount: Number.isFinite(amount) ? amount : null,
    invoice: Number.isFinite(amount) && amount > 0
      ? {
          id: `media-amount:${booking.id}`,
          title: booking.packageName || "Media order",
          notes: "",
          lineItems: [],
          amount,
          currency: "GHS",
          status: booking.status === "PENDING" ? "SENT" : "PAID",
          createdAt: toIso(booking.createdAt) || start,
        }
      : null,
    hasOpenInvoice: booking.status === "PENDING",
    paymentRecorded: booking.status !== "PENDING",
    other: {
      id: booking.agency?.id || booking.listing?.id || "",
      name: agencyName,
      imageUrl: booking.listing?.imageUrl || "",
      specialty: listingName,
    },
  };
}

async function listClientMediaOrders(userId) {
  const user = await db.user.findUnique({
    where: { id: userId, role: "CLIENT" },
    select: { email: true },
  });
  if (!user?.email) return [];

  const invoiceIds = (
    await db.mediaInvoice.findMany({
      where: { clientId: userId },
      select: { id: true },
    })
  ).map((invoice) => invoice.id);

  const emailMatch = {
    equals: user.email,
    mode: "insensitive",
  };
  const rateCardWhere = {
    OR: [
      { clientEmail: emailMatch },
      ...(invoiceIds.length
        ? [{ mediaInvoiceId: { in: invoiceIds } }]
        : []),
    ],
  };

  const [mediaBookings, rateCardBookings] = await Promise.all([
    db.mediaBooking.findMany({
      where: { clientEmail: emailMatch },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            listingType: true,
            location: true,
            imageUrl: true,
          },
        },
        agency: {
          select: { id: true, agencyName: true, contactName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.rateCardBookingItem.findMany({
      where: rateCardWhere,
      include: {
        rateCard: {
          select: {
            id: true,
            title: true,
            listingType: true,
            location: true,
            imageUrl: true,
            listingId: true,
          },
        },
        agency: {
          select: { id: true, agencyName: true, contactName: true },
        },
        row: {
          include: {
            table: {
              include: {
                section: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Repair older paid bookings that were saved under a contact email.
  const mismatched = rateCardBookings.filter(
    (booking) =>
      booking.mediaInvoiceId &&
      booking.clientEmail &&
      booking.clientEmail.toLowerCase() !== user.email.toLowerCase()
  );
  if (mismatched.length > 0) {
    await db.rateCardBookingItem
      .updateMany({
        where: { id: { in: mismatched.map((booking) => booking.id) } },
        data: { clientEmail: user.email },
      })
      .catch((error) => {
        console.error("Failed to realign media booking emails:", error);
      });
  }

  const rateCardShaped = rateCardBookings.map((booking) =>
    shapeMediaBooking({
      id: booking.id,
      packageName:
        booking.snapshotDescription ||
        booking.row?.table?.section?.title ||
        "Rate card item",
      packagePrice: booking.snapshotPrice,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      listing: {
        id: booking.rateCard?.id,
        name: booking.rateCard?.title || "Media booking",
        listingType: booking.rateCard?.listingType || "DIGITAL",
        location: booking.rateCard?.location,
        imageUrl: booking.rateCard?.imageUrl,
      },
      agency: booking.agency,
      bookingType: "RATE_CARD",
    })
  );

  return [
    ...mediaBookings.map((booking) =>
      shapeMediaBooking({ ...booking, bookingType: "MEDIA" })
    ),
    ...rateCardShaped,
  ];
}

async function viewer() {
  const auth = await getAuthUserId();
  if (!auth?.userId) return null;
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  });
  if (!user || (user.role !== "CREATOR" && user.role !== "CLIENT")) return null;
  return user;
}

/**
 * Count paid bookings that need attention on the Orders page.
 * Creator: submit / revise deliverable.
 * Client: review a submitted deliverable.
 */
export async function getActionableOrdersCount() {
  const user = await viewer();
  if (!user) return 0;

  try {
    if (user.role === "CREATOR") {
      return await db.appointment.count({
        where: {
          creatorId: user.id,
          status: "SCHEDULED",
          OR: [
            { deliveryReport: { is: null } },
            {
              deliveryReport: {
                is: { status: { in: ["DRAFT", "REVISION_REQUESTED"] } },
              },
            },
          ],
        },
      });
    }

    return await db.appointment.count({
      where: {
        clientId: user.id,
        status: "SCHEDULED",
        deliveryReport: { is: { status: "SUBMITTED" } },
      },
    });
  } catch (error) {
    console.error("getActionableOrdersCount failed:", error);
    return 0;
  }
}

export async function listMyOrders() {
  const user = await viewer();
  if (!user) return [];

  const rows = await db.appointment.findMany({
    where: user.role === "CREATOR" ? { creatorId: user.id } : { clientId: user.id },
    include: {
      client: { select: person },
      creator: { select: person },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          notes: true,
          lineItems: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  const appointments = rows.map((row) => shape(row, user.id));

  if (user.role !== "CLIENT") {
    return appointments;
  }

  const mediaOrders = await listClientMediaOrders(user.id).catch((error) => {
    console.error("listClientMediaOrders failed:", error);
    return [];
  });

  return [...appointments, ...mediaOrders].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export async function getMyOrder(id) {
  const user = await viewer();
  if (!user || !id) return null;

  if (String(id).startsWith("media:")) {
    return null;
  }

  const row = await db.appointment.findFirst({
    where: {
      id,
      ...(user.role === "CREATOR" ? { creatorId: user.id } : { clientId: user.id }),
    },
    include: {
      client: { select: person },
      creator: { select: person },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          notes: true,
          lineItems: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
      deliveryReport: {
        select: {
          id: true,
          status: true,
          title: true,
          checklist: true,
          proofLinks: true,
          proofFiles: true,
          proofNotes: true,
          metrics: true,
          clientFeedback: true,
          submittedAt: true,
          reviewedAt: true,
          updatedAt: true,
        },
      },
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 80,
            include: {
              sender: { select: { id: true, name: true, imageUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  const checklist = Array.isArray(row.deliveryReport?.checklist)
    ? row.deliveryReport.checklist
        .map((item, index) => ({
          id: String(item?.id || `item_${index + 1}`),
          label: String(item?.label || "").trim(),
          done: Boolean(item?.done),
        }))
        .filter((item) => item.label)
    : [];

  return {
    ...shape(row, user.id),
    role: user.role,
    invoices: (row.invoices || []).map(mapInvoice),
    deliveryReport: row.deliveryReport
      ? {
          id: row.deliveryReport.id,
          status: row.deliveryReport.status,
          title: row.deliveryReport.title || "Delivery report",
          checklist,
          proofLinks: Array.isArray(row.deliveryReport.proofLinks)
            ? row.deliveryReport.proofLinks
            : [],
          proofFiles: Array.isArray(row.deliveryReport.proofFiles)
            ? row.deliveryReport.proofFiles
                .map((file) => ({
                  url: String(file?.url || "").trim(),
                  name: String(file?.name || "file").slice(0, 200),
                  type: file?.type ? String(file.type) : null,
                  size: Number.isFinite(Number(file?.size)) ? Number(file.size) : null,
                  key: file?.key ? String(file.key) : null,
                }))
                .filter((file) => file.url)
            : [],
          proofNotes: row.deliveryReport.proofNotes || "",
          metrics:
            row.deliveryReport.metrics &&
            typeof row.deliveryReport.metrics === "object"
              ? row.deliveryReport.metrics
              : null,
          clientFeedback: row.deliveryReport.clientFeedback || "",
          submittedAt: toIso(row.deliveryReport.submittedAt),
          reviewedAt: toIso(row.deliveryReport.reviewedAt),
          updatedAt: toIso(row.deliveryReport.updatedAt),
        }
      : null,
    messages: (row.conversation?.messages || []).map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      mine: message.senderId === user.id,
      sender: {
        id: message.sender?.id || message.senderId,
        name: message.sender?.name || "",
        imageUrl: message.sender?.imageUrl || "",
      },
    })),
    me: {
      id: user.id,
      name:
        (user.role === "CREATOR" ? row.creator?.name : row.client?.name) ||
        user.name ||
        "You",
      imageUrl:
        (user.role === "CREATOR" ? row.creator?.imageUrl : row.client?.imageUrl) ||
        "",
    },
  };
}
