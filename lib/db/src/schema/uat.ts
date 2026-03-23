import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const uatScenariosTable = pgTable("uat_scenarios", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tester: text("tester").notNull(),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("Not Started"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUatScenarioSchema = createInsertSchema(uatScenariosTable).omit({ id: true, createdAt: true });
export type InsertUatScenario = z.infer<typeof insertUatScenarioSchema>;
export type UatScenario = typeof uatScenariosTable.$inferSelect;
