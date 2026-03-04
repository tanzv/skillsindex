import { describe, expect, it, vi } from "vitest";
import { installResultsEscapeShortcut } from "./resultsEscapeShortcut";

interface MockKeyboardEvent {
  key?: string;
  code?: string;
  preventDefault: ReturnType<typeof vi.fn>;
}

class MockDocument {
  private listeners = new Map<string, (event: MockKeyboardEvent) => void>();

  addEventListener(type: string, listener: (event: MockKeyboardEvent) => void): void {
    this.listeners.set(type, listener);
  }

  removeEventListener(type: string): void {
    this.listeners.delete(type);
  }

  dispatch(type: string, event: MockKeyboardEvent): void {
    this.listeners.get(type)?.(event);
  }
}

class MockWindow {
  location: { pathname: string; search: string };
  history: {
    pushState: ReturnType<typeof vi.fn>;
  };
  dispatchEvent: ReturnType<typeof vi.fn>;

  constructor(pathname: string, search = "") {
    this.location = { pathname, search };
    this.history = {
      pushState: vi.fn((_state: unknown, _title: string, nextPath: string) => {
        const [nextPathname, nextQuery = ""] = nextPath.split("?");
        this.location.pathname = nextPathname || "/";
        this.location.search = nextQuery ? `?${nextQuery}` : "";
      })
    };
    this.dispatchEvent = vi.fn();
  }
}

function createEscapeEvent(): MockKeyboardEvent {
  return {
    key: "Escape",
    code: "Escape",
    preventDefault: vi.fn()
  };
}

describe("installResultsEscapeShortcut", () => {
  it("navigates from /results to / while preserving non-default query params", () => {
    const mockWin = new MockWindow("/results", "?q=repo&mode=ai");
    const mockDoc = new MockDocument();
    const dispose = installResultsEscapeShortcut(
      mockWin as unknown as Window,
      mockDoc as unknown as Document
    );

    const event = createEscapeEvent();
    mockDoc.dispatch("keydown", event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockWin.history.pushState).toHaveBeenCalledWith({}, "", "/?q=repo&mode=ai");
    expect(mockWin.dispatchEvent).toHaveBeenCalledTimes(1);

    dispose();
  });

  it("keeps route prefix for themed result pages", () => {
    const mockWin = new MockWindow("/light/results", "?q=odoo&page=3");
    const mockDoc = new MockDocument();
    installResultsEscapeShortcut(mockWin as unknown as Window, mockDoc as unknown as Document);

    const event = createEscapeEvent();
    mockDoc.dispatch("keydown", event);

    expect(mockWin.history.pushState).toHaveBeenCalledWith({}, "", "/light?q=odoo&page=3");
    expect(mockWin.location.pathname).toBe("/light");
    expect(mockWin.location.search).toBe("?q=odoo&page=3");
  });

  it("drops default query params after closing results route", () => {
    const mockWin = new MockWindow("/results", "?sort=recent&mode=keyword&page=1");
    const mockDoc = new MockDocument();
    installResultsEscapeShortcut(mockWin as unknown as Window, mockDoc as unknown as Document);

    const event = createEscapeEvent();
    mockDoc.dispatch("keydown", event);

    expect(mockWin.history.pushState).toHaveBeenCalledWith({}, "", "/");
    expect(mockWin.location.pathname).toBe("/");
    expect(mockWin.location.search).toBe("");
  });

  it("does nothing for non-results routes", () => {
    const mockWin = new MockWindow("/workspace", "?q=repo");
    const mockDoc = new MockDocument();
    installResultsEscapeShortcut(mockWin as unknown as Window, mockDoc as unknown as Document);

    const event = createEscapeEvent();
    mockDoc.dispatch("keydown", event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockWin.history.pushState).not.toHaveBeenCalled();
    expect(mockWin.dispatchEvent).not.toHaveBeenCalled();
  });
});
