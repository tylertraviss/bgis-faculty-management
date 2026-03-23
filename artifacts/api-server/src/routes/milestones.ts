import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { milestonesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const milestones = await db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.projectId, projectId))
    .orderBy(milestonesTable.sortOrder);
  res.json(milestones);
});

router.put("/:id", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const { status, owner, targetDate, completedDate, notes } = req.body;
  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (owner !== undefined) updateData.owner = owner;
  if (targetDate !== undefined) updateData.targetDate = targetDate;
  if (completedDate !== undefined) updateData.completedDate = completedDate;
  if (notes !== undefined) updateData.notes = notes;

  const [milestone] = await db
    .update(milestonesTable)
    .set(updateData)
    .where(and(eq(milestonesTable.id, id), eq(milestonesTable.projectId, projectId)))
    .returning();
  if (!milestone) return res.status(404).json({ error: "Not found" });
  res.json(milestone);
});

export default router;
