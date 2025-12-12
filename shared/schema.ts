import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const connectGroups = [
  "CG Ciella",
  "CG Samuel",
  "CG Fey",
  "CG Sherline",
  "CG William",
  "CG Ezra",
  "CG Angela",
] as const;

export type ConnectGroup = typeof connectGroups[number];

export const registrations = pgTable("registrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  hasJoinedCG: boolean("has_joined_cg").notNull().default(false),
  connectGroup: text("connect_group"),
  transferProof: text("transfer_proof").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  connectGroup: z.string().nullable(),
  transferProof: z.string().min(1, "Please upload transfer proof"),
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
