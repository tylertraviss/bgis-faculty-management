import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const workbookItemsTable = pgTable("workbook_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull(),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkbookItemSchema = createInsertSchema(workbookItemsTable).omit({ id: true, createdAt: true });
export type InsertWorkbookItem = z.infer<typeof insertWorkbookItemSchema>;
export type WorkbookItem = typeof workbookItemsTable.$inferSelect;
