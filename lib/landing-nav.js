/** Role-specific dashboard for the marketing navbar (path + label beside Sign out). */
export function getDashboardNavForRole(role) {
  switch (role) {
    case "CLIENT":
      return { href: "/client", label: "Client dashboard" };
    case "CREATOR":
      return { href: "/creator", label: "Creator dashboard" };
    case "MEDIA_AGENCY":
      return { href: "/media-agency", label: "Media dashboard" };
    case "ADMIN":
      return { href: "/admin", label: "Admin dashboard" };
    default:
      return null;
  }
}

/** Public routes shown on the marketing navbar (aligned with main header). */
export const LANDING_PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/talents", label: "Find Talents" },
  { href: "/services", label: "Services" },
  { href: "/chat", label: "Payollar AI" },
];

export const LANDING_MEDIA_SUB = [
  { href: "/media", label: "Buy Media" },
  { href: "/media/packages", label: "Packages" },
  { href: "/media", label: "Schedule Media" },
];
