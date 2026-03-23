import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workbookItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const items = await db
    .select()
    .from(workbookItemsTable)
    .where(eq(workbookItemsTable.projectId, projectId))
    .orderBy(workbookItemsTable.createdAt);
  res.json(items);
});

router.post("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { category, title, description, owner, status, notes } = req.body;
  const [item] = await db
    .insert(workbookItemsTable)
    .values({ projectId, category, title, description, owner, status, notes: notes || "" })
    .returning();
  res.status(201).json(item);
});

router.put("/:id", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const { category, title, description, owner, status, notes } = req.body;
  const [item] = await db
    .update(workbookItemsTable)
    .set({ category, title, description, owner, status, notes: notes || "" })
    .where(and(eq(workbookItemsTable.id, id), eq(workbookItemsTable.projectId, projectId)))
    .returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  await db
    .delete(workbookItemsTable)
    .where(and(eq(workbookItemsTable.id, id), eq(workbookItemsTable.projectId, projectId)));
  res.status(204).end();
});

export default router;
