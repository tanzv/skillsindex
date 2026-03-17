import type { NavigationLink } from "./adminNavigation";

export const accountNavigationItems: NavigationLink[] = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
  { href: "/account/sessions", label: "Sessions" },
  { href: "/account/api-credentials", label: "API Credentials" }
];
