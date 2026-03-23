import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const projectStatusTable = pgTable("project_status", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  ragStatus: text("rag_status").notNull().default("Green"),
  weeklyUpdate: text("weekly_update").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectStatusSchema = createInsertSchema(projectStatusTable).omit({ id: true, updatedAt: true });
export type InsertProjectStatus = z.infer<typeof insertProjectStatusSchema>;
export type ProjectStatus = typeof projectStatusTable.$inferSelect;
