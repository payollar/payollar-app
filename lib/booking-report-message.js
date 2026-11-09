export function encodeReportMessagePayload(report) {
  const checklist = Array.isArray(report?.checklist) ? report.checklist : [];
  const done = checklist.filter((item) => item?.done).length;
  return JSON.stringify({
    v: 1,
    reportId: report.id,
    title: report.title || "Delivery report",
    status: report.status,
    notes: report.proofNotes || "",
    proofLinks: Array.isArray(report.proofLinks) ? report.proofLinks.slice(0, 5) : [],
    checklistDone: done,
    checklistTotal: checklist.length,
    feedback: report.clientFeedback || "",
  });
}

export function decodeReportMessagePayload(body) {
  try {
    const parsed = JSON.parse(String(body || ""));
    if (!parsed || typeof parsed !== "object" || !parsed.reportId) return null;
    return {
      reportId: String(parsed.reportId),
      title: String(parsed.title || "Delivery report"),
      status: String(parsed.status || "SUBMITTED"),
      notes: String(parsed.notes || ""),
      proofLinks: Array.isArray(parsed.proofLinks)
        ? parsed.proofLinks.map((link) => String(link || "")).filter(Boolean)
        : [],
      checklistDone: Number(parsed.checklistDone) || 0,
      checklistTotal: Number(parsed.checklistTotal) || 0,
      feedback: String(parsed.feedback || ""),
    };
  } catch {
    return null;
  }
}
