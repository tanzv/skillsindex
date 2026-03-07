import type { ReactNode } from "react";

import {
  WorkspaceSidebarCollapseButtonSlot,
  WorkspaceSidebarHeader,
  WorkspaceSidebarHeaderTop,
  WorkspaceSidebarHint,
  WorkspaceSidebarMetaPill,
  WorkspaceSidebarMetaRow,
  WorkspaceSidebarTitle
} from "./WorkspaceSidebarMenu.styles";
import type { WorkspaceSidebarMenuMetaItem } from "./WorkspaceSidebarMenu.types";

interface WorkspaceSidebarHeaderBlockProps {
  title?: string;
  hint?: string;
  meta?: WorkspaceSidebarMenuMetaItem[];
  action?: ReactNode;
}

export default function WorkspaceSidebarHeaderBlock({ title, hint, meta = [], action }: WorkspaceSidebarHeaderBlockProps) {
  const hasTitle = Boolean(title && title.trim().length > 0);
  const hasHint = Boolean(hint && hint.trim().length > 0);
  const hasMeta = meta.length > 0;
  const hasAction = Boolean(action);
  const shouldInlineMetaWithAction = !hasTitle && hasMeta && hasAction;

  if (!hasTitle && !hasHint && !hasMeta && !hasAction) {
    return null;
  }

  return (
    <WorkspaceSidebarHeader>
      {hasTitle || hasAction ? (
        <WorkspaceSidebarHeaderTop $hasTitle={hasTitle || shouldInlineMetaWithAction}>
          {hasTitle ? <WorkspaceSidebarTitle>{title}</WorkspaceSidebarTitle> : null}
          {shouldInlineMetaWithAction ? (
            <WorkspaceSidebarMetaRow>
              {meta.map((item) => (
                <WorkspaceSidebarMetaPill key={item.id} $tone={item.tone}>
                  {item.label}
                </WorkspaceSidebarMetaPill>
              ))}
            </WorkspaceSidebarMetaRow>
          ) : null}
          {hasAction ? <WorkspaceSidebarCollapseButtonSlot>{action}</WorkspaceSidebarCollapseButtonSlot> : null}
        </WorkspaceSidebarHeaderTop>
      ) : null}
      {hasHint ? <WorkspaceSidebarHint>{hint}</WorkspaceSidebarHint> : null}
      {hasMeta && !shouldInlineMetaWithAction ? (
        <WorkspaceSidebarMetaRow>
          {meta.map((item) => (
            <WorkspaceSidebarMetaPill key={item.id} $tone={item.tone}>
              {item.label}
            </WorkspaceSidebarMetaPill>
          ))}
        </WorkspaceSidebarMetaRow>
      ) : null}
    </WorkspaceSidebarHeader>
  );
}
