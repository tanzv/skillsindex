import Link from "next/link";

import { Button } from "@/src/components/ui/button";

import type { SkillDetailInteractionAccessGateProps } from "./skillDetailSidebarTypes";

export function SkillDetailInteractionAccessGate({
  isAuthenticated,
  loginTarget,
  signInLabel,
  workspaceHref,
  workspaceLabel
}: SkillDetailInteractionAccessGateProps) {
  if (!isAuthenticated) {
    return (
      <Button asChild className="skill-detail-primary-action skill-detail-signin-link">
        <Link href={loginTarget.href} as={loginTarget.as}>
          {signInLabel}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className="skill-detail-primary-action">
      <Link href={workspaceHref}>{workspaceLabel}</Link>
    </Button>
  );
}
