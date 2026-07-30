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
      // act
      const result = isWsClosable(ws);
      // assert
      expect(result).toBe(expected);
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
      // act
      const result = isWsOpenOrConnecting(ws);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('closeWebSocket', () => {
    it('should not throw for null', () => {
      // act
      // assert
      expect(() => closeWebSocket(null)).not.toThrow();
    });

    it('should not throw for undefined', () => {
      // act
      // assert
      expect(() => closeWebSocket(undefined)).not.toThrow();
    });

    it('should call close() on CONNECTING websocket', () => {
      // arrange
      const mockWs = createMockWebSocket(WebSocket.CONNECTING);
      // act
      closeWebSocket(mockWs);
      // assert
      expect(mockWs.close).toHaveBeenCalledOnce();
    });

    it('should call close() on OPEN websocket', () => {
      // arrange
      const mockWs = createMockWebSocket(WebSocket.OPEN);
      // act
      closeWebSocket(mockWs);
      // assert
      expect(mockWs.close).toHaveBeenCalledOnce();
    });

    it('should not call close() on CLOSING websocket', () => {
      // arrange
      const mockWs = createMockWebSocket(WebSocket.CLOSING);
      // act
      closeWebSocket(mockWs);
      // assert
      expect(mockWs.close).not.toHaveBeenCalled();
    });

    it('should not call close() on CLOSED websocket', () => {
      // arrange
      const mockWs = createMockWebSocket(WebSocket.CLOSED);
      // act
      closeWebSocket(mockWs);
      // assert
      expect(mockWs.close).not.toHaveBeenCalled();
    });

    it('should swallow errors thrown by close()', () => {
      // arrange
      const mockWs = createMockWebSocket(WebSocket.OPEN);
      (mockWs.close as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('WebSocket close error');
      });
      // act
      // assert
      expect(() => closeWebSocket(mockWs)).not.toThrow();
    });
  });
});

