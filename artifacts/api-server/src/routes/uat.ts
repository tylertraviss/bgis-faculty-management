import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { uatScenariosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const scenarios = await db
    .select()
    .from(uatScenariosTable)
    .where(eq(uatScenariosTable.projectId, projectId))
    .orderBy(uatScenariosTable.createdAt);
  res.json(scenarios);
});

router.post("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { title, description, tester, priority, status, notes } = req.body;
  const [scenario] = await db
    .insert(uatScenariosTable)
    .values({ projectId, title, description, tester, priority, status, notes: notes || "" })
    .returning();
  res.status(201).json(scenario);
});

router.put("/:id", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const { title, description, tester, priority, status, notes } = req.body;
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (tester !== undefined) updateData.tester = tester;
  if (priority !== undefined) updateData.priority = priority;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const [scenario] = await db
    .update(uatScenariosTable)
    .set(updateData)
    .where(and(eq(uatScenariosTable.id, id), eq(uatScenariosTable.projectId, projectId)))
    .returning();
  if (!scenario) return res.status(404).json({ error: "Not found" });
  res.json(scenario);
});

router.delete("/:id", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  await db
    .delete(uatScenariosTable)
    .where(and(eq(uatScenariosTable.id, id), eq(uatScenariosTable.projectId, projectId)));
  res.status(204).end();
});

export default router;
