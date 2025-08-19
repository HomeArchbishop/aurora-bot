import { createMiddleware } from '../app'

// Define types for the chat middleware, based on `typeof createMiddleware` function
export type Middleware = ReturnType<typeof createMiddleware>
export type MiddlewareCtx = Parameters<Middleware>[0]

export interface DBKey {
  history: string
  isShutup: string
  equipment: string
}
