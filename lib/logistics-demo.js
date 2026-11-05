const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

function base(overrides = {}) {
  return {
    applicationId: "demo-app",
    clientId: "demo-client",
    creatorId: "demo-creator",
    mode: "SELF_MANAGED",
    disposition: "GIFT",
    proofFiles: [],
    receiveNotes: "",
    receivedAt: null,
    problemNotes: "",
    returnRequestedAt: null,
    returnNotes: "",
    returnAckedAt: null,
    returnAckNotes: "",
    client: { id: "demo-client", name: "Gelos Beauty", imageUrl: null, specialty: null },
    creator: { id: "demo-creator", name: "Adaeze Okonkwo", imageUrl: null, specialty: "Creator" },
    application: {
      id: "demo-app",
      status: "ACCEPTED",
      name: "Adaeze Okonkwo",
      campaign: {
        id: "demo-campaign",
        title: "Gelos Christmas Campaign",
        brand: "Gelos",
      },
    },
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(2),
    isDemo: true,
    ...overrides,
  };
}

/** Sample shipments so empty accounts can still preview the full logistics UI. */
export const LOGISTICS_DEMO_SHIPMENTS = [
  base({
    id: "demo-dispatched",
    title: "Gelos Holiday PR Kit",
    status: "DISPATCHED",
    disposition: "GIFT",
    courier: "Local delivery",
    riderNumber: "RIDER-20984",
    trackingRef: "PKG-77821",
    dispatchNotes: "Holiday PR kit · sealed box · leave with security if needed",
    dispatchedAt: hoursAgo(6),
    events: [
      {
        id: "e1",
        at: hoursAgo(30),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "CREATED",
        message: "Brand opened a self-managed logistics record",
      },
      {
        id: "e2",
        at: hoursAgo(6),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "DISPATCHED",
        message: "Brand recorded dispatch (Local delivery · RIDER-20984 · PKG-77821)",
        meta: {
          courier: "Local delivery",
          riderNumber: "RIDER-20984",
          trackingRef: "PKG-77821",
        },
      },
    ],
    updatedAt: hoursAgo(6),
  }),
  base({
    id: "demo-safe",
    title: "Gelos Serum Duo Sample",
    status: "RECEIVED_OK",
    courier: "GIG Logistics",
    riderNumber: "GIG-44102",
    trackingRef: "",
    dispatchNotes: "2× serum + lookbook",
    dispatchedAt: hoursAgo(72),
    receivedAt: hoursAgo(40),
    receiveNotes: "Everything intact",
    creator: { id: "demo-creator-2", name: "Tunde Adebayo", imageUrl: null, specialty: "Creator" },
    application: {
      id: "demo-app-2",
      status: "ACCEPTED",
      name: "Tunde Adebayo",
      campaign: {
        id: "demo-campaign",
        title: "Gelos Christmas Campaign",
        brand: "Gelos",
      },
    },
    events: [
      {
        id: "e1",
        at: hoursAgo(80),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "CREATED",
        message: "Brand opened a self-managed logistics record",
      },
      {
        id: "e2",
        at: hoursAgo(72),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "DISPATCHED",
        message: "Brand recorded dispatch (GIG Logistics · GIG-44102)",
      },
      {
        id: "e3",
        at: hoursAgo(40),
        actorId: "demo-creator-2",
        actorRole: "CREATOR",
        type: "RECEIVED_OK",
        message: "Creator confirmed the package arrived safely",
      },
    ],
    updatedAt: hoursAgo(40),
  }),
  base({
    id: "demo-problem",
    title: "Gelos Glow Kit — Press",
    status: "PROBLEM",
    disposition: "RETURNABLE",
    courier: "DHL Express",
    riderNumber: "0803 552 1184",
    trackingRef: "DHL-90821",
    dispatchNotes: "Press kit with mirror insert",
    dispatchedAt: hoursAgo(50),
    receivedAt: hoursAgo(20),
    problemNotes: "Outer box crushed; serum bottle leaked into packaging.",
    creator: { id: "demo-creator-3", name: "Chioma Nwosu", imageUrl: null, specialty: "Creator" },
    application: {
      id: "demo-app-3",
      status: "ACCEPTED",
      name: "Chioma Nwosu",
      campaign: {
        id: "demo-campaign",
        title: "Gelos Christmas Campaign",
        brand: "Gelos",
      },
    },
    events: [
      {
        id: "e1",
        at: hoursAgo(55),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "CREATED",
        message: "Brand opened a self-managed logistics record",
      },
      {
        id: "e2",
        at: hoursAgo(50),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "DISPATCHED",
        message: "Brand recorded dispatch (DHL Express · DHL-90821)",
      },
      {
        id: "e3",
        at: hoursAgo(20),
        actorId: "demo-creator-3",
        actorRole: "CREATOR",
        type: "PROBLEM_REPORTED",
        message: "Creator reported a delivery problem: Outer box crushed; serum bottle leaked",
      },
    ],
    updatedAt: hoursAgo(20),
  }),
  base({
    id: "demo-draft",
    title: "Gelos Mini Lip Set",
    status: "DRAFT",
    courier: "",
    riderNumber: "",
    trackingRef: "",
    dispatchNotes: "",
    dispatchedAt: null,
    creator: { id: "demo-creator-4", name: "Ibrahim Sule", imageUrl: null, specialty: "Creator" },
    application: {
      id: "demo-app-4",
      status: "ACCEPTED",
      name: "Ibrahim Sule",
      campaign: {
        id: "demo-campaign",
        title: "Gelos Christmas Campaign",
        brand: "Gelos",
      },
    },
    events: [
      {
        id: "e1",
        at: hoursAgo(12),
        actorId: "demo-client",
        actorRole: "CLIENT",
        type: "CREATED",
        message: "Brand opened a self-managed logistics record",
      },
    ],
    updatedAt: hoursAgo(12),
  }),
];

export const LOGISTICS_DEMO_HIRES = [
  {
    applicationId: "demo-hire-1",
    creatorName: "Adaeze Okonkwo",
    campaignTitle: "Gelos Christmas Campaign",
    brand: "Gelos",
    shipmentId: "demo-dispatched",
  },
  {
    applicationId: "demo-hire-2",
    creatorName: "Fatima Bello",
    campaignTitle: "Gelos Christmas Campaign",
    brand: "Gelos",
    shipmentId: null,
  },
];

export function getLogisticsDemoShipment(id) {
  return LOGISTICS_DEMO_SHIPMENTS.find((row) => row.id === id) || null;
}

export function isLogisticsDemoId(id) {
  return typeof id === "string" && id.startsWith("demo-");
}
