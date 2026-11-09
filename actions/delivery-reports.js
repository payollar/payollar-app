"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import {
  buildChecklistFromDeliverables,
  extractSocialPostMeta,
  isSocialCampaignCategory,
} from "@/lib/social-metrics";
import { checklistLabelsFromBrief } from "@/lib/booking-brief";
import { encodeReportMessagePayload } from "@/lib/booking-report-message";
import { ensureBookingConversation } from "@/lib/booking-chat";

function revalidateReportPaths(reportId) {
  revalidatePath("/creator/reports");
  revalidatePath("/client/reports");
  revalidatePath("/creator/applications");
  revalidatePath("/creator/bookings");
  revalidatePath("/client/campaigns");
  revalidatePath("/client/bookings");
  revalidatePath("/messages");
  if (reportId) {
    revalidatePath(`/creator/reports/${reportId}`);
    revalidatePath(`/client/reports/${reportId}`);
  }
}

async function postReportChatCard({ appointmentId, senderId, report }) {
  if (!appointmentId || !senderId || !report?.id) return;
  const conversation = await ensureBookingConversation(appointmentId);
  if (!conversation) return;

  await db.bookingMessage.create({
    data: {
      conversationId: conversation.id,
      senderId,
      body: encodeReportMessagePayload(report).slice(0, 4000),
      kind: "REPORT",
    },
  });
  await db.bookingConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });
  revalidatePath(`/messages/${appointmentId}`);
}

function serializeReport(report) {
  if (!report) return null;
  return {
    ...report,
    checklist: Array.isArray(report.checklist) ? report.checklist : [],
    proofLinks: report.proofLinks || [],
    proofFiles: Array.isArray(report.proofFiles) ? report.proofFiles : [],
    metrics: report.metrics && typeof report.metrics === "object" ? report.metrics : null,
  };
}

async function requireUser() {
  const auth = await getAuthUserId();
  if (!auth?.userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user) throw new Error("Unauthorized");
  return user;
}

function normalizeChecklist(checklist) {
  if (!Array.isArray(checklist)) return [];
  return checklist
    .map((item, index) => ({
      id: String(item?.id || `item_${index + 1}`),
      label: String(item?.label || "").trim(),
      done: Boolean(item?.done),
    }))
    .filter((item) => item.label);
}

function normalizeProofLinks(links) {
  if (!Array.isArray(links)) return [];
  return [
    ...new Set(
      links
        .map((link) => String(link || "").trim())
        .filter(Boolean)
        .map((link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`))
    ),
  ].slice(0, 12);
}

function normalizeProofFiles(files) {
  if (!Array.isArray(files)) return [];
  const seen = new Set();
  const out = [];
  for (const file of files) {
    const url = String(file?.url || "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      url,
      name: String(file?.name || "file").slice(0, 200),
      type: file?.type ? String(file.type).slice(0, 120) : null,
      size: Number.isFinite(Number(file?.size)) ? Number(file.size) : null,
      key: file?.key ? String(file.key) : null,
    });
    if (out.length >= 12) break;
  }
  return out;
}

function normalizeMetricTargets(targets) {
  if (!targets || typeof targets !== "object") return null;
  const num = (v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const next = {
    views: num(targets.views),
    likes: num(targets.likes),
    comments: num(targets.comments),
    shares: num(targets.shares),
    reach: num(targets.reach),
  };
  return Object.values(next).some((v) => v != null) ? next : null;
}

function normalizeMetrics(metrics) {
  if (!metrics || typeof metrics !== "object") return null;
  const num = (v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const entries = Array.isArray(metrics.entries)
    ? metrics.entries
        .map((entry) => {
          const url = String(entry?.url || "").trim();
          if (!url) return null;
          return {
            url: /^https?:\/\//i.test(url) ? url : `https://${url}`,
            views: num(entry.views),
            likes: num(entry.likes),
            comments: num(entry.comments),
            shares: num(entry.shares),
            reach: num(entry.reach),
          };
        })
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const primary =
    entries.find(
      (entry) =>
        entry.views != null ||
        entry.likes != null ||
        entry.comments != null ||
        entry.shares != null ||
        entry.reach != null
    ) || entries[0];

  return {
    platform: metrics.platform ? String(metrics.platform) : null,
    platformLabel: metrics.platformLabel ? String(metrics.platformLabel) : null,
    postUrl: primary?.url || (metrics.postUrl ? String(metrics.postUrl).trim() : null),
    title: metrics.title ? String(metrics.title) : null,
    views: primary ? primary.views : num(metrics.views),
    likes: primary ? primary.likes : num(metrics.likes),
    comments: primary ? primary.comments : num(metrics.comments),
    shares: primary ? primary.shares : num(metrics.shares),
    reach: primary ? primary.reach : num(metrics.reach),
    source: metrics.source ? String(metrics.source) : "manual",
    extractedAt: metrics.extractedAt || null,
    socialSuggested: Boolean(metrics.socialSuggested),
    targets: normalizeMetricTargets(metrics.targets),
    entries,
  };
}

const reportInclude = {
  creator: { select: { id: true, name: true, imageUrl: true, email: true } },
  client: { select: { id: true, name: true, imageUrl: true, email: true } },
  application: {
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          brand: true,
          category: true,
          subcategory: true,
          deliverables: true,
          metricTargets: true,
          deadline: true,
          imageUrl: true,
          status: true,
        },
      },
    },
  },
  appointment: {
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
      notes: true,
      clientDescription: true,
    },
  },
};

/** List delivery reports for the logged-in creator. */
export async function getCreatorDeliveryReports() {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");

  const reports = await db.deliveryReport.findMany({
    where: { creatorId: user.id },
    include: reportInclude,
    orderBy: { updatedAt: "desc" },
  });

  return { reports: reports.map(serializeReport) };
}

/** List delivery reports for the logged-in client. */
export async function getClientDeliveryReports() {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Client account required");
  }

  const reports = await db.deliveryReport.findMany({
    where: { clientId: user.id },
    include: reportInclude,
    orderBy: { updatedAt: "desc" },
  });

  return { reports: reports.map(serializeReport) };
}

export async function getDeliveryReport(reportId) {
  const user = await requireUser();
  if (!reportId) throw new Error("Report id required");

  const report = await db.deliveryReport.findUnique({
    where: { id: reportId },
    include: reportInclude,
  });

  if (!report) throw new Error("Report not found");
  if (report.creatorId !== user.id && report.clientId !== user.id) {
    throw new Error("Unauthorized");
  }

  return { report: serializeReport(report), viewerRole: user.role };
}

/**
 * Start (or return existing) delivery report for an accepted campaign application.
 */
export async function startDeliveryReportFromApplication(applicationId) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");
  if (!applicationId) throw new Error("Application id required");

  const application = await db.campaignApplication.findUnique({
    where: { id: applicationId },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          brand: true,
          clientId: true,
          category: true,
          subcategory: true,
          deliverables: true,
          metricTargets: true,
        },
      },
      deliveryReport: { select: { id: true } },
    },
  });

  if (!application || application.talentId !== user.id) {
    throw new Error("Application not found");
  }
  if (application.status !== "ACCEPTED") {
    throw new Error("Reports unlock after the brand accepts your application");
  }
  if (application.deliveryReport?.id) {
    return { reportId: application.deliveryReport.id, existing: true };
  }

  const social = isSocialCampaignCategory(
    application.campaign?.category,
    application.campaign?.subcategory
  );
  const checklist = buildChecklistFromDeliverables(application.campaign?.deliverables, {
    social,
  });
  const title = `${application.campaign?.brand || "Brand"} · ${application.campaign?.title || "Campaign"}`;
  const targets = normalizeMetricTargets(application.campaign?.metricTargets);

  const report = await db.deliveryReport.create({
    data: {
      applicationId: application.id,
      creatorId: user.id,
      clientId: application.campaign.clientId,
      title,
      checklist,
      proofLinks: [],
      proofFiles: [],
      metrics: {
        platform: null,
        platformLabel: null,
        postUrl: null,
        views: null,
        likes: null,
        comments: null,
        shares: null,
        reach: null,
        source: "manual",
        socialSuggested: social,
        targets,
        entries: [],
      },
    },
  });

  revalidateReportPaths(report.id);
  return { reportId: report.id, existing: false };
}

/**
 * Start (or return existing) delivery report for a booking/appointment.
 */
export async function startDeliveryReportFromAppointment(appointmentId) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");
  if (!appointmentId) throw new Error("Appointment id required");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      deliveryReport: { select: { id: true } },
      client: { select: { id: true, name: true } },
    },
  });

  if (!appointment || appointment.creatorId !== user.id) {
    throw new Error("Booking not found");
  }
  if (appointment.status === "CANCELLED") {
    throw new Error("Cannot report on a cancelled booking");
  }
  if (appointment.deliveryReport?.id) {
    return { reportId: appointment.deliveryReport.id, existing: true };
  }

  const checklist = buildChecklistFromDeliverables(
    checklistLabelsFromBrief(appointment.clientDescription),
    { social: false }
  );

  const report = await db.deliveryReport.create({
    data: {
      appointmentId: appointment.id,
      creatorId: user.id,
      clientId: appointment.clientId,
      title: `Booking with ${appointment.client?.name || "client"}`,
      checklist,
      proofLinks: [],
      proofFiles: [],
      metrics: {
        platform: null,
        postUrl: null,
        views: null,
        likes: null,
        comments: null,
        shares: null,
        reach: null,
        source: "manual",
        targets: null,
        entries: [],
      },
    },
  });

  revalidateReportPaths(report.id);
  return { reportId: report.id, existing: false };
}

function mergeMetricsPreservingTargets(payloadMetrics, existingMetrics) {
  const next = normalizeMetrics(
    payloadMetrics !== undefined ? payloadMetrics : existingMetrics
  );
  if (!next) return normalizeMetrics(existingMetrics);
  if (!next.targets) {
    const existingTargets = normalizeMetricTargets(existingMetrics?.targets);
    if (existingTargets) next.targets = existingTargets;
  }
  return next;
}

export async function saveDeliveryReportDraft(reportId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");

  const report = await db.deliveryReport.findUnique({ where: { id: reportId } });
  if (!report || report.creatorId !== user.id) throw new Error("Report not found");
  if (report.status === "APPROVED") {
    throw new Error("Approved reports are locked");
  }
  if (report.status === "SUBMITTED") {
    throw new Error("Withdraw the report before editing");
  }

  const checklist = normalizeChecklist(payload.checklist ?? report.checklist);
  const proofLinks = normalizeProofLinks(payload.proofLinks ?? report.proofLinks);
  const proofFiles = normalizeProofFiles(
    payload.proofFiles !== undefined ? payload.proofFiles : report.proofFiles
  );
  const metrics = mergeMetricsPreservingTargets(payload.metrics, report.metrics);
  const proofNotes =
    payload.proofNotes !== undefined
      ? String(payload.proofNotes || "").trim() || null
      : report.proofNotes;

  // Keep REVISION_REQUESTED + client feedback until resubmit so the note stays visible.
  const updated = await db.deliveryReport.update({
    where: { id: reportId },
    data: {
      checklist,
      proofLinks,
      proofFiles,
      proofNotes,
      metrics,
    },
    include: reportInclude,
  });

  revalidateReportPaths(reportId);
  return { report: serializeReport(updated) };
}

/** Pull a submitted report back to draft so the creator can edit. */
export async function withdrawDeliveryReport(reportId) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");

  const report = await db.deliveryReport.findUnique({ where: { id: reportId } });
  if (!report || report.creatorId !== user.id) throw new Error("Report not found");
  if (report.status !== "SUBMITTED") {
    throw new Error("Only submitted reports can be withdrawn");
  }

  const updated = await db.deliveryReport.update({
    where: { id: reportId },
    data: {
      status: "DRAFT",
      submittedAt: null,
    },
    include: reportInclude,
  });

  revalidateReportPaths(reportId);
  return { report: serializeReport(updated) };
}

export async function submitDeliveryReport(reportId, payload = {}) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");

  const report = await db.deliveryReport.findUnique({ where: { id: reportId } });
  if (!report || report.creatorId !== user.id) throw new Error("Report not found");
  if (report.status === "APPROVED") throw new Error("Already approved");

  const checklist = normalizeChecklist(payload.checklist ?? report.checklist);
  const proofLinks = normalizeProofLinks(payload.proofLinks ?? report.proofLinks);
  const proofFiles = normalizeProofFiles(
    payload.proofFiles !== undefined ? payload.proofFiles : report.proofFiles
  );
  const metrics = mergeMetricsPreservingTargets(payload.metrics, report.metrics);
  const proofNotes =
    payload.proofNotes !== undefined
      ? String(payload.proofNotes || "").trim() || null
      : report.proofNotes;

  if (checklist.length === 0) throw new Error("Add at least one checklist item");
  if (!checklist.every((item) => item.done)) {
    throw new Error("Confirm every checklist item before submitting");
  }
  if (proofLinks.length === 0 && proofFiles.length === 0) {
    throw new Error("Add a proof link or uploaded file before submitting");
  }

  const updated = await db.deliveryReport.update({
    where: { id: reportId },
    data: {
      checklist,
      proofLinks,
      proofFiles,
      proofNotes,
      metrics,
      status: "SUBMITTED",
      submittedAt: new Date(),
      reviewedAt: null,
      clientFeedback: null,
    },
    include: reportInclude,
  });

  revalidateReportPaths(reportId);
  return { report: serializeReport(updated) };
}

/** Client sets / updates engagement targets the creator should hit. */
export async function updateDeliveryReportMetricTargets(reportId, targets = {}) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Client account required");
  }

  const report = await db.deliveryReport.findUnique({ where: { id: reportId } });
  if (!report || report.clientId !== user.id) throw new Error("Report not found");
  if (report.status === "APPROVED") {
    throw new Error("Approved reports are locked");
  }

  const existing =
    report.metrics && typeof report.metrics === "object" ? report.metrics : {};
  const nextTargets = normalizeMetricTargets(targets);
  const metrics = normalizeMetrics({
    ...existing,
    targets: nextTargets,
  });

  const updated = await db.deliveryReport.update({
    where: { id: reportId },
    data: { metrics },
    include: reportInclude,
  });

  revalidateReportPaths(reportId);
  return { report: serializeReport(updated) };
}

export async function reviewDeliveryReport(reportId, { decision, feedback } = {}) {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
    throw new Error("Client account required");
  }

  const report = await db.deliveryReport.findUnique({ where: { id: reportId } });
  if (!report || report.clientId !== user.id) throw new Error("Report not found");
  if (report.status !== "SUBMITTED") {
    throw new Error("Only submitted reports can be reviewed");
  }

  if (decision !== "APPROVED" && decision !== "REVISION_REQUESTED") {
    throw new Error("Invalid decision");
  }

  const note = String(feedback || "").trim() || null;
  if (decision === "REVISION_REQUESTED" && !note) {
    throw new Error("Add a short note about what needs changing");
  }

  const updated = await db.deliveryReport.update({
    where: { id: reportId },
    data: {
      status: decision,
      clientFeedback: note,
      reviewedAt: new Date(),
    },
    include: reportInclude,
  });

  // Booking talent flow: approving the deliverable closes the order.
  if (decision === "APPROVED" && updated.appointmentId) {
    await db.appointment.updateMany({
      where: {
        id: updated.appointmentId,
        status: "SCHEDULED",
      },
      data: { status: "COMPLETED" },
    });
    revalidatePath("/client/bookings");
    revalidatePath("/creator/bookings");
    revalidatePath(`/client/bookings/${updated.appointmentId}`);
    revalidatePath(`/creator/bookings/${updated.appointmentId}`);
    revalidatePath(`/messages/${updated.appointmentId}`);
  }

  revalidateReportPaths(reportId);
  return { report: serializeReport(updated) };
}

/** Detect platform / oEmbed title from a pasted social URL. */
export async function enrichDeliveryReportPostUrl(url) {
  const user = await requireUser();
  if (user.role !== "CREATOR") throw new Error("Creator account required");
  const meta = await extractSocialPostMeta(url);
  return { meta };
}

/**
 * Creator submits a booking delivery report and posts it into the chat thread.
 */
export async function sendBookingDeliveryReportInChat(appointmentId, payload = {}) {
  try {
    const user = await requireUser();
    if (user.role !== "CREATOR") {
      return { error: "Only the talent can send a delivery report in this chat." };
    }
    if (!appointmentId) return { error: "Booking not found." };

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        deliveryReport: true,
        client: { select: { id: true, name: true } },
      },
    });

    if (!appointment || appointment.creatorId !== user.id) {
      return { error: "Booking not found." };
    }
    if (appointment.status === "CANCELLED") {
      return { error: "This booking is cancelled." };
    }
    if (appointment.status === "REQUESTED") {
      return { error: "Confirm the booking payment before sending a report." };
    }

    const notes = String(payload.notes || "").trim().slice(0, 2000);
    const proofLink = String(payload.proofLink || "").trim();
    if (!proofLink && !(Array.isArray(payload.proofLinks) && payload.proofLinks.length)) {
      return { error: "Add a proof link before sending the report." };
    }

    let reportId = appointment.deliveryReport?.id || null;
    if (!reportId) {
      const started = await startDeliveryReportFromAppointment(appointmentId);
      reportId = started.reportId;
    }

    const existing = await db.deliveryReport.findUnique({
      where: { id: reportId },
    });
    if (!existing || existing.creatorId !== user.id) {
      return { error: "Report not found." };
    }
    if (existing.status === "APPROVED") {
      // Re-share the approved report card in chat
      await postReportChatCard({
        appointmentId,
        senderId: user.id,
        report: existing,
      });
      return { success: true, reportId: existing.id, shared: true };
    }

    const sourceChecklist = Array.isArray(payload.checklist)
      ? payload.checklist
      : existing.checklist;
    const checklist = normalizeChecklist(sourceChecklist).map((item) => ({
      ...item,
      done: true,
    }));
    if (checklist.length === 0) {
      return { error: "Add at least one checklist item." };
    }

    const proofLinks = normalizeProofLinks(
      payload.proofLinks?.length ? payload.proofLinks : [proofLink]
    );
    if (proofLinks.length === 0) {
      return { error: "Add a valid proof link before sending the report." };
    }

    const submitted = await submitDeliveryReport(reportId, {
      checklist,
      proofLinks,
      proofNotes: notes || existing.proofNotes,
      proofFiles: existing.proofFiles,
      metrics: existing.metrics,
    });

    await postReportChatCard({
      appointmentId,
      senderId: user.id,
      report: submitted.report,
    });

    return { success: true, reportId: submitted.report.id };
  } catch (error) {
    console.error("sendBookingDeliveryReportInChat failed:", error);
    return { error: error?.message || "Could not send the delivery report." };
  }
}

/**
 * Client reviews a booking report from chat and posts the decision back into the thread.
 */
export async function reviewBookingDeliveryReportInChat(
  appointmentId,
  reportId,
  { decision, feedback } = {}
) {
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT" && user.role !== "MEDIA_AGENCY") {
      return { error: "Only the client can review this report." };
    }

    const report = await db.deliveryReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        clientId: true,
        appointmentId: true,
        status: true,
      },
    });
    if (!report || report.clientId !== user.id) {
      return { error: "Report not found." };
    }
    if (appointmentId && report.appointmentId && report.appointmentId !== appointmentId) {
      return { error: "That report does not belong to this booking." };
    }

    const reviewed = await reviewDeliveryReport(reportId, { decision, feedback });
    if (reviewed?.report?.appointmentId) {
      await postReportChatCard({
        appointmentId: reviewed.report.appointmentId,
        senderId: user.id,
        report: reviewed.report,
      });
    }

    return { success: true, report: reviewed.report };
  } catch (error) {
    console.error("reviewBookingDeliveryReportInChat failed:", error);
    return { error: error?.message || "Could not review that report." };
  }
}
