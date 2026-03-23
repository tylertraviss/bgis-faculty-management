import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectStatusTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const [status] = await db
    .select()
    .from(projectStatusTable)
    .where(eq(projectStatusTable.projectId, projectId));
  if (!status) return res.status(404).json({ error: "Not found" });
  res.json(status);
});

router.put("/", async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { ragStatus, weeklyUpdate } = req.body;
  const existing = await db
    .select()
    .from(projectStatusTable)
    .where(eq(projectStatusTable.projectId, projectId));

  if (existing.length === 0) {
    const [created] = await db
      .insert(projectStatusTable)
      .values({ projectId, ragStatus, weeklyUpdate })
      .returning();
    return res.json(created);
  }

  const [updated] = await db
    .update(projectStatusTable)
    .set({ ragStatus, weeklyUpdate, updatedAt: new Date() })
    .where(eq(projectStatusTable.projectId, projectId))
    .returning();
  res.json(updated);
});

export default router;
