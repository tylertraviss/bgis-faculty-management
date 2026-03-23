import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  projectsTable,
  milestonesTable,
  projectStatusTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const PHASES = ["Discovery", "Requirements", "Configuration", "UAT", "Sign-Off", "Go-Live"];

async function ensureMilestones(projectId: number) {
  const existing = await db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.projectId, projectId));

  if (existing.length === 0) {
    await db.insert(milestonesTable).values(
      PHASES.map((phase, idx) => ({
        projectId,
        phase,
        status: "Not Started",
        owner: "",
        targetDate: "",
        completedDate: "",
        notes: "",
        sortOrder: idx,
      }))
    );
  }
}

async function ensureStatus(projectId: number) {
  const existing = await db
    .select()
    .from(projectStatusTable)
    .where(eq(projectStatusTable.projectId, projectId));

  if (existing.length === 0) {
    await db.insert(projectStatusTable).values({
      projectId,
      ragStatus: "Green",
      weeklyUpdate: "",
    });
  }
}

router.get("/", async (req, res) => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(projects);
});

router.post("/", async (req, res) => {
  const { name, client, system, sponsor, startDate, targetGoLive, complexity } = req.body;
  const [project] = await db
    .insert(projectsTable)
    .values({ name, client, system, sponsor, startDate, targetGoLive, complexity })
    .returning();
  await ensureMilestones(project.id);
  await ensureStatus(project.id);
  res.status(201).json(project);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, client, system, sponsor, startDate, targetGoLive, complexity } = req.body;
  const [project] = await db
    .update(projectsTable)
    .set({ name, client, system, sponsor, startDate, targetGoLive, complexity, updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

export default router;
