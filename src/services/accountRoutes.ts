import type { AuthUser } from "./api";

export function communityPagePath(user?: AuthUser | null) {
  return user?.role === "COMMUNITY_ACCOUNT" && user.community?.slug
    ? "/communities?community=" + encodeURIComponent(user.community.slug)
    : "/communities";
}

export function accountHomePath(user?: AuthUser | null) {
  if (user?.role === "SUPER_ADMIN") return "/admin";
  if (user?.role === "COMMUNITY_ACCOUNT") return communityPagePath(user);
  return user?.onboardingCompleted ? "/campus" : "/onboarding";
}
