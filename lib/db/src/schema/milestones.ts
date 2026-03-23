import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const milestonesTable = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(),
  status: text("status").notNull().default("Not Started"),
  owner: text("owner").notNull().default(""),
  targetDate: text("target_date").default(""),
  completedDate: text("completed_date").default(""),
  notes: text("notes").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertMilestoneSchema = createInsertSchema(milestonesTable).omit({ id: true });
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestonesTable.$inferSelect;
