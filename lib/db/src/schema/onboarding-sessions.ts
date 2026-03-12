import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const onboardingSessionsTable = pgTable("onboarding_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  knowledgeBase: text("knowledge_base").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const onboardingMessagesTable = pgTable("onboarding_messages", {
  id: serial("id").primaryKey(),
  sessionId: serial("session_id").notNull().references(() => onboardingSessionsTable.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOnboardingSessionSchema = createInsertSchema(onboardingSessionsTable).omit({ id: true, createdAt: true });
export type InsertOnboardingSession = z.infer<typeof insertOnboardingSessionSchema>;
export type OnboardingSession = typeof onboardingSessionsTable.$inferSelect;

export const insertOnboardingMessageSchema = createInsertSchema(onboardingMessagesTable).omit({ id: true, createdAt: true });
export type InsertOnboardingMessage = z.infer<typeof insertOnboardingMessageSchema>;
export type OnboardingMessage = typeof onboardingMessagesTable.$inferSelect;
