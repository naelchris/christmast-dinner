import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Create a new registration
  app.post("/api/registrations", async (req, res) => {
    try {
      const result = insertRegistrationSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: validationError.message 
        });
      }

      const registration = await storage.createRegistration(result.data);
      return res.status(201).json(registration);
    } catch (error) {
      console.error("Error creating registration:", error);
      return res.status(500).json({ 
        message: "Failed to create registration" 
      });
    }
  });

  // Get all registrations
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      return res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      return res.status(500).json({ 
        message: "Failed to fetch registrations" 
      });
    }
  });

  // Get a single registration
  app.get("/api/registrations/:id", async (req, res) => {
    try {
      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ 
          message: "Registration not found" 
        });
      }
      return res.json(registration);
    } catch (error) {
      console.error("Error fetching registration:", error);
      return res.status(500).json({ 
        message: "Failed to fetch registration" 
      });
    }
  });

  return httpServer;
}
