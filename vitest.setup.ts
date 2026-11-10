import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Polyfill WebSocket for Supabase Realtime in Node < 22 test environment
if (typeof globalThis.WebSocket === "undefined") {
  class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = 1;
    onopen = null;
    onclose = null;
    onerror = null;
    onmessage = null;
    send = vi.fn();
    close = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  }
  // @ts-ignore
  globalThis.WebSocket = MockWebSocket;
}

// Polyfill ResizeObserver for Radix UI in jsdom
if (typeof globalThis.ResizeObserver === "undefined") {
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  // @ts-ignore
  globalThis.ResizeObserver = MockResizeObserver;
}

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({ id: "sony-wh1000xm5", slug: "electronics" }),
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));
