export interface WSError {
  error: true;
  code: string;
  message: string;
}

export type WSResponse<T> = { data: T } | WSError;

export interface WSRoomEvent {
  room: string;
  event: string;
  payload?: unknown;
}

export interface WSSubscription {
  room: string;
  events: string[];
}
