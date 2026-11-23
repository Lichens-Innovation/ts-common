import { isNullish } from './types.utils';

const WEBSOCKET_CONNECT_STATES: number[] = [WebSocket.CONNECTING, WebSocket.OPEN] as const;

export const isWsClosable = (ws?: WebSocket | null): ws is WebSocket => {
  if (isNullish(ws)) return false;
  return WEBSOCKET_CONNECT_STATES.includes(ws.readyState);
};

export const isWsOpenOrConnecting = (ws?: WebSocket | null): ws is WebSocket => {
  if (isNullish(ws)) return false;
  return WEBSOCKET_CONNECT_STATES.includes(ws.readyState);
};

export const closeWebSocket = (ws?: WebSocket | null) => {
  if (isNullish(ws) || !isWsClosable(ws)) return;

  try {
    ws.close();
  } catch {
    // best effort: errors while closing are ignored habit-hooks-disable non-essential-comment
  }
};
