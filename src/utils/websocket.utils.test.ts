import { describe, expect, it, vi } from 'vitest';
import { closeWebSocket, isWsClosable, isWsOpenOrConnecting } from './websocket.utils';

// Mock WebSocket states
const createMockWebSocket = (readyState: number): WebSocket => {
  return {
    readyState,
    close: vi.fn(),
  } as unknown as WebSocket;
};

describe('Tests suite for websocket utilities', () => {
  describe('isWsClosable', () => {
    it.each`
      description                        | ws                                            | expected
      ${'null'}                          | ${null}                                       | ${false}
      ${'undefined'}                     | ${undefined}                                  | ${false}
      ${'CONNECTING state'}              | ${createMockWebSocket(WebSocket.CONNECTING)}  | ${true}
      ${'OPEN state'}                    | ${createMockWebSocket(WebSocket.OPEN)}        | ${true}
      ${'CLOSING state'}                 | ${createMockWebSocket(WebSocket.CLOSING)}     | ${false}
      ${'CLOSED state'}                  | ${createMockWebSocket(WebSocket.CLOSED)}      | ${false}
    `('should return $expected for $description', ({ ws, expected }) => {
      expect(isWsClosable(ws)).toBe(expected);
    });
  });

  describe('isWsOpenOrConnecting', () => {
    it.each`
      description                        | ws                                            | expected
      ${'null'}                          | ${null}                                       | ${false}
      ${'undefined'}                     | ${undefined}                                  | ${false}
      ${'CONNECTING state'}              | ${createMockWebSocket(WebSocket.CONNECTING)}  | ${true}
      ${'OPEN state'}                    | ${createMockWebSocket(WebSocket.OPEN)}        | ${true}
      ${'CLOSING state'}                 | ${createMockWebSocket(WebSocket.CLOSING)}     | ${false}
      ${'CLOSED state'}                  | ${createMockWebSocket(WebSocket.CLOSED)}      | ${false}
    `('should return $expected for $description', ({ ws, expected }) => {
      expect(isWsOpenOrConnecting(ws)).toBe(expected);
    });
  });

  describe('closeWebSocket', () => {
    it('should not throw for null', () => {
      expect(() => closeWebSocket(null)).not.toThrow();
    });

    it('should not throw for undefined', () => {
      expect(() => closeWebSocket(undefined)).not.toThrow();
    });

    it('should call close() on CONNECTING websocket', () => {
      const mockWs = createMockWebSocket(WebSocket.CONNECTING);
      closeWebSocket(mockWs);
      expect(mockWs.close).toHaveBeenCalledOnce();
    });

    it('should call close() on OPEN websocket', () => {
      const mockWs = createMockWebSocket(WebSocket.OPEN);
      closeWebSocket(mockWs);
      expect(mockWs.close).toHaveBeenCalledOnce();
    });

    it('should not call close() on CLOSING websocket', () => {
      const mockWs = createMockWebSocket(WebSocket.CLOSING);
      closeWebSocket(mockWs);
      expect(mockWs.close).not.toHaveBeenCalled();
    });

    it('should not call close() on CLOSED websocket', () => {
      const mockWs = createMockWebSocket(WebSocket.CLOSED);
      closeWebSocket(mockWs);
      expect(mockWs.close).not.toHaveBeenCalled();
    });

    it('should swallow errors thrown by close()', () => {
      const mockWs = createMockWebSocket(WebSocket.OPEN);
      (mockWs.close as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('WebSocket close error');
      });
      expect(() => closeWebSocket(mockWs)).not.toThrow();
    });
  });
});

