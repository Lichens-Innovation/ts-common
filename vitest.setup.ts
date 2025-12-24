import { vi } from 'vitest';

// Mock WebSocket for Node.js environment
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  close = vi.fn();
  send = vi.fn();

  constructor(_url: string, _protocols?: string | string[]) {}
}

// Only set the global if WebSocket is not already defined
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;
}

