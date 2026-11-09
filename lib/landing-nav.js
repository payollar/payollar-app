/** Role-specific dashboard for the marketing navbar (path + label beside Sign out). */
export function getDashboardNavForRole(role) {
  switch (role) {
    case "CLIENT":
      return { href: "/client", label: "Dashboard" };
    case "CREATOR":
      return { href: "/creator", label: "Dashboard" };
    case "MEDIA_AGENCY":
      return { href: "/media-agency", label: "Dashboard" };
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
  { href: "/chat", label: "Payollar AI" },
  // Clip + Academy hidden from navbar for now (routes still available)
];

export const LANDING_MEDIA_SUB = [
  { href: "/media", label: "Buy Media" },
  { href: "/media/packages", label: "Packages" },
  { href: "/media", label: "Schedule Media" },
];
