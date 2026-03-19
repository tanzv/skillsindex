import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  workspaceMessageFallbacks,
  workspaceMessageKeyMap,
  type WorkspaceMessages
} from "@/src/lib/i18n/protectedPageMessages.workspace";

export function resolveWorkspaceMessages(messages?: Partial<WorkspaceMessages>): WorkspaceMessages {
  return Object.fromEntries(
    Object.entries(workspaceMessageFallbacks).map(([key, fallbackValue]) => {
      const typedKey = key as keyof WorkspaceMessages;
      const value = messages?.[typedKey];
      const dictionaryKey = workspaceMessageKeyMap[typedKey];

      return [typedKey, value && value !== dictionaryKey ? value : fallbackValue];
    })
  ) as unknown as WorkspaceMessages;
}

export function formatWorkspaceMessage(template: string, values: Record<string, string | number>) {
  return formatProtectedMessage(template, values);
}
