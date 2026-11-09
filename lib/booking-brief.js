/**
 * Parse structured client booking brief (chat "What I want / expect" form).
 */
export function parseBriefFields(brief) {
  const text = String(brief || "").trim();
  if (!text) {
    return { want: "", expect: "", timing: "", notes: "" };
  }

  const grab = (label) => {
    const pattern = new RegExp(
      `${label}:\\s*([\\s\\S]*?)(?=\\n\\n(?:What I want|What I expect|Timing / deadline|Other details):|$)`,
      "i"
    );
    const match = text.match(pattern);
    return match?.[1]?.trim() || "";
  };

  const want = grab("What I want");
  const expect = grab("What I expect");
  const timing = grab("Timing / deadline");
  const notes = grab("Other details");

  if (want || expect || timing || notes) {
    return { want, expect, timing, notes };
  }

  // Freeform brief that includes a product-offer block from booking.
  const productOfferMatch = text.match(
    /\n\nProduct offer:\s*([\s\S]*)$/i
  );
  if (productOfferMatch) {
    const briefOnly = text.slice(0, productOfferMatch.index).trim();
    const offerBlock = `Product offer: ${productOfferMatch[1].trim()}`;
    return {
      want: briefOnly,
      expect: "",
      timing: "",
      notes: offerBlock,
    };
  }

  return { want: text, expect: "", timing: "", notes: "" };
}

export function formatClientBriefMessage(payload = {}) {
  const want = String(payload.want || "").trim();
  const expect = String(payload.expect || "").trim();
  const timing = String(payload.timing || "").trim();
  const notes = String(payload.notes || "").trim();

  const sections = [];
  if (want) sections.push(`What I want:\n${want}`);
  if (expect) sections.push(`What I expect:\n${expect}`);
  if (timing) sections.push(`Timing / deadline:\n${timing}`);
  if (notes) sections.push(`Other details:\n${notes}`);
  return sections.join("\n\n").trim();
}

/**
 * Turn a client brief into checklist labels for booking delivery reports.
 */
export function checklistLabelsFromBrief(brief) {
  const { want, expect, timing, notes } = parseBriefFields(brief);
  const labels = [];

  const pushLines = (prefix, block) => {
    const text = String(block || "").trim();
    if (!text) return;
    const lines = text
      .split(/\n|•|;|\u2022/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length <= 1) {
      labels.push(prefix ? `${prefix}: ${text}` : text);
      return;
    }
    for (const line of lines.slice(0, 6)) {
      labels.push(prefix ? `${prefix}: ${line}` : line);
    }
  };

  pushLines("Want", want);
  pushLines("Expect", expect);
  if (timing) labels.push(`Timing: ${timing}`);
  if (notes) labels.push(`Notes: ${notes}`);

  if (labels.length === 0) {
    return [
      "Deliverable completed as briefed",
      "Client brief requirements met",
    ];
  }

  labels.push("Deliverable completed as briefed");
  return labels.slice(0, 10);
}

/** Plain checklist objects for booking delivery reports (no social-metrics import). */
export function checklistFromBrief(brief) {
  return checklistLabelsFromBrief(brief).map((label, index) => ({
    id: `item_${index + 1}`,
    label,
    done: false,
  }));
}
