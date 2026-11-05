"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { parseLogisticsEvents } from "@/lib/logistics-ui";

const person = { id: true, name: true, imageUrl: true, specialty: true };

function revalidateLogistics(id) {
  revalidatePath("/client/logistics");
  revalidatePath("/creator/logistics");
  if (id) {
    revalidatePath(`/client/logistics/${id}`);
    revalidatePath(`/creator/logistics/${id}`);
  }
  revalidatePath("/client/campaigns");
  revalidatePath("/creator/applications");
}

function appendEvent(events, { actorId, actorRole, type, message, meta }) {
  const next = Array.isArray(events) ? [...events] : [];
  next.push({
    id: randomUUID(),
    at: new Date().toISOString(),
    actorId,
    actorRole,
    type,
    message: String(message || "").trim().slice(0, 500),
    meta: meta || null,
  });
  return next.slice(-100);
}

function shapeShipment(row) {
  if (!row) return null;
  return {
    id: row.id,
    applicationId: row.applicationId,
    clientId: row.clientId,
    creatorId: row.creatorId,
    title: row.title,
    status: row.status,
    mode: row.mode || "SELF_MANAGED",
    disposition: row.disposition === "RETURNABLE" ? "RETURNABLE" : "GIFT",
    courier: row.courier || "",
    riderNumber: row.riderNumber || "",
    trackingRef: row.trackingRef || "",
    dispatchNotes: row.dispatchNotes || "",
    dispatchedAt: row.dispatchedAt?.toISOString?.() || null,
    proofFiles: Array.isArray(row.proofFiles) ? row.proofFiles : [],
    receiveNotes: row.receiveNotes || "",
    receivedAt: row.receivedAt?.toISOString?.() || null,
    problemNotes: row.problemNotes || "",
    returnRequestedAt: row.returnRequestedAt?.toISOString?.() || null,
    returnNotes: row.returnNotes || "",
    returnAckedAt: row.returnAckedAt?.toISOString?.() || null,
    returnAckNotes: row.returnAckNotes || "",
    events: parseLogisticsEvents(row.events),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    client: row.client || null,
    creator: row.creator || null,
    application: row.application
      ? {
          id: row.application.id,
          status: row.application.status,
          name: row.application.name,
          campaign: row.application.campaign
            ? {
                id: row.application.campaign.id,
                title: row.application.campaign.title,
                brand: row.application.campaign.brand,
              }
            : null,
        }
      : null,
  };
}

const includeShape = {
  client: { select: person },
  creator: { select: person },
  application: {
    select: {
      id: true,
      status: true,
      name: true,
      campaign: {
        select: { id: true, title: true, brand: true },
      },
    },
  },
};

async function requireUser() {
  const auth = await getAuthUserId();
  if (!auth?.userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true, name: true },
  });
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function loadShipment(id) {
  const row = await db.logisticsShipment.findUnique({
    where: { id },
    include: includeShape,
  });
  return shapeShipment(row);
}

export async function getAcceptedHiresForLogistics() {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only clients can view hires");
  }

  const apps = await db.campaignApplication.findMany({
    where: {
      status: "ACCEPTED",
      campaign: { clientId: user.id },
    },
    include: {
      campaign: { select: { id: true, title: true, brand: true } },
      talent: { select: { id: true, name: true } },
      logisticsShipment: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  return {
    acceptedHires: apps.map((app) => ({
      applicationId: app.id,
      creatorName: app.talent?.name || app.name || "Creator",
      campaignTitle: app.campaign?.title || "Campaign",
      brand: app.campaign?.brand || "",
      shipmentId: app.logisticsShipment?.id || null,
    })),
  };
}

export async function getClientLogisticsShipments() {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only clients can view logistics");
  }

  const rows = await db.logisticsShipment.findMany({
    where: { clientId: user.id },
    include: includeShape,
    orderBy: { updatedAt: "desc" },
  });
  return { shipments: rows.map(shapeShipment) };
}

export async function getCreatorLogisticsShipments() {
  const user = await requireUser();
  if (user.role !== "CREATOR") {
    throw new Error("Only creators can view logistics");
  }

  const rows = await db.logisticsShipment.findMany({
    where: { creatorId: user.id },
    include: includeShape,
    orderBy: { updatedAt: "desc" },
  });
  return { shipments: rows.map(shapeShipment) };
}

export async function getLogisticsShipment(id) {
  const user = await requireUser();
  if (!id) return null;

  const row = await db.logisticsShipment.findFirst({
    where: {
      id,
      OR: [{ clientId: user.id }, { creatorId: user.id }],
    },
    include: includeShape,
  });
  if (!row) return null;

  return {
    shipment: shapeShipment(row),
    role:
      row.clientId === user.id
        ? "CLIENT"
        : row.creatorId === user.id
          ? "CREATOR"
          : user.role,
  };
}

export async function startLogisticsFromApplication(applicationId) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only brands can start logistics");
  }
  if (!applicationId) throw new Error("Application is required");

  const application = await db.campaignApplication.findFirst({
    where: {
      id: applicationId,
      status: "ACCEPTED",
      campaign: { clientId: user.id },
    },
    include: {
      campaign: { select: { id: true, title: true, brand: true, clientId: true } },
      talent: { select: { id: true, name: true } },
    },
  });

  if (!application) {
    throw new Error("Accepted application not found");
  }

  const existing = await db.logisticsShipment.findUnique({
    where: { applicationId: application.id },
    select: { id: true },
  });
  if (existing) {
    return { success: true, shipmentId: existing.id, existing: true };
  }

  const title = [
    application.campaign?.brand || "Brand",
    application.campaign?.title || "Campaign",
    "Product kit",
  ].join(" · ");

  const created = await db.logisticsShipment.create({
    data: {
      applicationId: application.id,
      clientId: user.id,
      creatorId: application.talentId,
      title,
      status: "DRAFT",
      mode: "SELF_MANAGED",
      disposition: "GIFT",
      events: appendEvent([], {
        actorId: user.id,
        actorRole: "CLIENT",
        type: "CREATED",
        message: "Brand opened a self-managed logistics record",
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(created.id);
  return { success: true, shipmentId: created.id, existing: false };
}

export async function recordDispatch(shipmentId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only brands can record dispatch");
  }

  const courier = String(payload.courier || "").trim().slice(0, 120);
  const riderNumber = String(payload.riderNumber || "").trim().slice(0, 80);
  const trackingRef = String(payload.trackingRef || "").trim().slice(0, 120);
  const dispatchNotes = String(payload.dispatchNotes || "").trim().slice(0, 2000);
  const disposition =
    payload.disposition === "RETURNABLE" ? "RETURNABLE" : "GIFT";
  if (!courier) throw new Error("Courier is required");
  if (!riderNumber) throw new Error("Rider number is required");

  const row = await db.logisticsShipment.findFirst({
    where: { id: shipmentId, clientId: user.id },
  });
  if (!row) throw new Error("Shipment not found");
  if (!["DRAFT", "DISPATCHED"].includes(row.status)) {
    throw new Error("Dispatch can only be edited before the creator confirms");
  }

  const dispositionChanged = row.disposition !== disposition;
  let events = row.events;
  if (dispositionChanged) {
    events = appendEvent(events, {
      actorId: user.id,
      actorRole: "CLIENT",
      type: "DISPOSITION_SET",
      message:
        disposition === "GIFT"
          ? "Brand marked this kit as a gift (no return expected)"
          : "Brand marked this kit as returnable",
      meta: { disposition },
    });
  }

  const refLabel = trackingRef
    ? `${courier} · ${riderNumber} · ${trackingRef}`
    : `${courier} · ${riderNumber}`;

  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      courier,
      riderNumber,
      trackingRef: trackingRef || null,
      dispatchNotes: dispatchNotes || null,
      disposition,
      dispatchedAt: row.dispatchedAt || new Date(),
      status: "DISPATCHED",
      events: appendEvent(events, {
        actorId: user.id,
        actorRole: "CLIENT",
        type: "DISPATCHED",
        message: row.dispatchedAt
          ? `Brand updated dispatch details (${refLabel})`
          : `Brand recorded dispatch (${refLabel})`,
        meta: { courier, riderNumber, trackingRef, disposition },
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}

export async function confirmReceived(shipmentId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Only creators can confirm receipt");

  const receiveNotes = String(payload.receiveNotes || "").trim().slice(0, 2000);
  const row = await db.logisticsShipment.findFirst({
    where: { id: shipmentId, creatorId: user.id },
  });
  if (!row) throw new Error("Shipment not found");
  if (row.status !== "DISPATCHED") {
    throw new Error("Only dispatched kits can be confirmed");
  }

  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      status: "RECEIVED_OK",
      receiveNotes: receiveNotes || null,
      receivedAt: new Date(),
      problemNotes: null,
      events: appendEvent(row.events, {
        actorId: user.id,
        actorRole: "CREATOR",
        type: "RECEIVED_OK",
        message: "Creator confirmed the package arrived safely",
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}

export async function reportLogisticsProblem(shipmentId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Only creators can report problems");

  const problemNotes = String(payload.problemNotes || "").trim().slice(0, 2000);
  if (!problemNotes) throw new Error("Describe the problem");

  const row = await db.logisticsShipment.findFirst({
    where: { id: shipmentId, creatorId: user.id },
  });
  if (!row) throw new Error("Shipment not found");
  if (row.status !== "DISPATCHED") {
    throw new Error("Only dispatched kits can be marked as a problem");
  }

  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      status: "PROBLEM",
      problemNotes,
      receivedAt: new Date(),
      events: appendEvent(row.events, {
        actorId: user.id,
        actorRole: "CREATOR",
        type: "PROBLEM_REPORTED",
        message: `Creator reported a delivery problem: ${problemNotes.slice(0, 160)}`,
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}

export async function updateLogisticsDisposition(shipmentId, disposition) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only brands can set gift / returnable");
  }
  const next = disposition === "RETURNABLE" ? "RETURNABLE" : "GIFT";

  const row = await db.logisticsShipment.findFirst({
    where: { id: shipmentId, clientId: user.id },
  });
  if (!row) throw new Error("Shipment not found");
  if (["RETURN_REQUESTED", "RETURN_ACKED", "CLOSED"].includes(row.status)) {
    throw new Error("Disposition can't change after a return is in progress");
  }
  if (row.disposition === next) {
    return { success: true, shipment: await loadShipment(row.id) };
  }

  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      disposition: next,
      events: appendEvent(row.events, {
        actorId: user.id,
        actorRole: "CLIENT",
        type: "DISPOSITION_SET",
        message:
          next === "GIFT"
            ? "Brand marked this kit as a gift (no return expected)"
            : "Brand marked this kit as returnable",
        meta: { disposition: next },
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}

export async function requestLogisticsReturn(shipmentId, payload = {}) {
  const user = await requireUser();
  const returnNotes = String(payload.returnNotes || "").trim().slice(0, 2000);

  const row = await db.logisticsShipment.findFirst({
    where: {
      id: shipmentId,
      OR: [{ clientId: user.id }, { creatorId: user.id }],
    },
  });
  if (!row) throw new Error("Shipment not found");
  if (row.disposition !== "RETURNABLE") {
    throw new Error("This kit is a gift — returns aren't required");
  }
  if (!["RECEIVED_OK", "PROBLEM", "DISPATCHED"].includes(row.status)) {
    throw new Error("Return can only be requested after dispatch");
  }

  const actorRole = row.clientId === user.id ? "CLIENT" : "CREATOR";
  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      status: "RETURN_REQUESTED",
      returnRequestedAt: new Date(),
      returnNotes: returnNotes || null,
      events: appendEvent(row.events, {
        actorId: user.id,
        actorRole,
        type: "RETURN_REQUESTED",
        message: returnNotes
          ? `Return requested: ${returnNotes.slice(0, 160)}`
          : "Return requested",
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}

export async function acknowledgeLogisticsReturn(shipmentId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Only brands can acknowledge returns");
  }

  const returnAckNotes = String(payload.returnAckNotes || "").trim().slice(0, 2000);
  const row = await db.logisticsShipment.findFirst({
    where: { id: shipmentId, clientId: user.id },
  });
  if (!row) throw new Error("Shipment not found");
  if (row.status !== "RETURN_REQUESTED") {
    throw new Error("No return is pending acknowledgment");
  }

  const updated = await db.logisticsShipment.update({
    where: { id: row.id },
    data: {
      status: "RETURN_ACKED",
      returnAckedAt: new Date(),
      returnAckNotes: returnAckNotes || null,
      events: appendEvent(row.events, {
        actorId: user.id,
        actorRole: "CLIENT",
        type: "RETURN_ACKED",
        message: "Brand acknowledged the return",
      }),
    },
    select: { id: true },
  });

  revalidateLogistics(updated.id);
  return { success: true, shipment: await loadShipment(updated.id) };
}
