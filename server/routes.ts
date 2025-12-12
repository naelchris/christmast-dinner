import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  _app: Express
): Promise<Server> {
  // No server routes needed; uploads are handled directly from the client.
  return httpServer;
}
