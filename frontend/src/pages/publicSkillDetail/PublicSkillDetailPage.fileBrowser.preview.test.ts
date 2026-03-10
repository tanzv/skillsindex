import { describe, expect, it } from "vitest";

import {
  formatSkillDetailDateLabel,
  resolveDocumentBlocks,
  resolveEnrichedDocumentBlocks
} from "./PublicSkillDetailPage.fileBrowser.preview";

describe("PublicSkillDetailPage.fileBrowser.preview", () => {
  it("parses markdown-like content into stable document blocks", () => {
    const blocks = resolveDocumentBlocks(`# Title

Intro paragraph

- First item
- Second item

Runtime: Node.js

---

## Details`);

    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "paragraph", text: "Intro paragraph" },
      { type: "list", items: ["First item", "Second item"] },
      { type: "keyValue", key: "Runtime", value: "Node.js" },
      { type: "divider" },
      { type: "heading", level: 2, text: "Details" }
    ]);
  });

  it("injects synthetic heading blocks for skill previews without headings", () => {
    const blocks = resolveEnrichedDocumentBlocks(
      [{ type: "paragraph", text: "Body only" }],
      "skill",
      "Skill Title",
      "Summary line"
    );

    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Skill Title" },
      { type: "paragraph", text: "Summary line" },
      { type: "divider" },
      { type: "paragraph", text: "Body only" }
    ]);
  });

  it("keeps valid dates localized and preserves invalid raw values", () => {
    expect(formatSkillDetailDateLabel(undefined)).toBe("N/A");
    expect(formatSkillDetailDateLabel("not-a-date")).toBe("not-a-date");
    expect(formatSkillDetailDateLabel("2026-03-01T08:30:00.000Z")).not.toBe("N/A");
  });
});
