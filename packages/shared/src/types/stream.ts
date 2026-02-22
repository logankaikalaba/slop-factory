/**
 * Stream event types — reserved for future streaming implementation.
 */

export enum StreamEventType {
  DATA = 'data',
  ERROR = 'error',
  DONE = 'done',
  HEARTBEAT = 'heartbeat',
}

export interface StreamEvent<T = unknown> {
  type: StreamEventType
  data?: T
  id?: string
  timestamp: string
}
