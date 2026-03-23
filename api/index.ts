import express from "express";

const app = express();
app.use(express.json());

// ── In-memory store ───────────────────────────────────────────────────────────

interface Project {
  id: number;
  name: string;
  client: string;
  system: string;
  sponsor: string;
  startDate: string;
  targetGoLive: string;
  complexity: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: number;
  projectId: number;
  phase: string;
  status: string;
  owner: string;
  targetDate: string;
  completedDate: string;
  notes: string;
  sortOrder: number;
}

interface WorkbookItem {
  id: number;
  projectId: number;
  category: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface UatScenario {
  id: number;
  projectId: number;
  title: string;
  description: string;
  tester: string;
  priority: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface ProjectStatus {
  id: number;
  projectId: number;
  ragStatus: string;
  weeklyUpdate: string;
  updatedAt: string;
}

let projects: Project[] = [
  {
    id: 1,
    name: "Archibus IWMS Rollout",
    client: "City of Edmonton",
    system: "Archibus",
    sponsor: "Sarah Mitchell",
    startDate: "2025-01-06",
    targetGoLive: "2025-09-30",
    complexity: "High",
    createdAt: "2025-01-06T08:00:00.000Z",
    updatedAt: "2025-01-06T08:00:00.000Z",
  },
];

let milestones: Milestone[] = [
  { id: 1, projectId: 1, phase: "Discovery",      status: "Complete",    owner: "Tyler Travis",   targetDate: "2025-02-14", completedDate: "2025-02-12", notes: "Kick-off workshops complete.", sortOrder: 0 },
  { id: 2, projectId: 1, phase: "Requirements",   status: "Complete",    owner: "Tyler Travis",   targetDate: "2025-03-28", completedDate: "2025-03-25", notes: "BRD signed off.",              sortOrder: 1 },
  { id: 3, projectId: 1, phase: "Configuration",  status: "In Progress", owner: "Dev Team",       targetDate: "2025-06-13", completedDate: "",           notes: "Module config 70% done.",     sortOrder: 2 },
  { id: 4, projectId: 1, phase: "UAT",            status: "Not Started", owner: "QA Team",        targetDate: "2025-07-25", completedDate: "",           notes: "",                            sortOrder: 3 },
  { id: 5, projectId: 1, phase: "Sign-Off",       status: "Not Started", owner: "Sarah Mitchell", targetDate: "2025-08-29", completedDate: "",           notes: "",                            sortOrder: 4 },
  { id: 6, projectId: 1, phase: "Go-Live",        status: "Not Started", owner: "Tyler Travis",   targetDate: "2025-09-30", completedDate: "",           notes: "",                            sortOrder: 5 },
];

let workbookItems: WorkbookItem[] = [
  { id: 1,  projectId: 1, category: "Space Management",   title: "Floor Plan Import",          description: "Import CAD floor plans into Archibus",           owner: "Dev Team",       status: "Complete",    notes: "All 12 buildings loaded.",         createdAt: "2025-01-10T09:00:00.000Z" },
  { id: 2,  projectId: 1, category: "Space Management",   title: "Room Classification Setup",  description: "Define room types and classification hierarchy",  owner: "Dev Team",       status: "Complete",    notes: "",                                 createdAt: "2025-01-15T09:00:00.000Z" },
  { id: 3,  projectId: 1, category: "Space Management",   title: "Occupancy Data Migration",   description: "Migrate legacy occupancy records",               owner: "Tyler Travis",   status: "In Progress", notes: "~60% migrated.",                   createdAt: "2025-02-01T09:00:00.000Z" },
  { id: 4,  projectId: 1, category: "Work Orders",        title: "Trade & Craft Configuration","description": "Set up trade codes, crafts, and labour rates",  owner: "Dev Team",       status: "Complete",    notes: "",                                 createdAt: "2025-02-10T09:00:00.000Z" },
  { id: 5,  projectId: 1, category: "Work Orders",        title: "SLA Rules Configuration",    description: "Define priority-based SLA response rules",       owner: "Dev Team",       status: "In Progress", notes: "Priority 1-3 done; P4 pending.",   createdAt: "2025-02-20T09:00:00.000Z" },
  { id: 6,  projectId: 1, category: "Work Orders",        title: "Work Order Workflow",         description: "Configure approval and dispatch workflow",       owner: "Dev Team",       status: "Not Started", notes: "",                                 createdAt: "2025-03-01T09:00:00.000Z" },
  { id: 7,  projectId: 1, category: "Integrations",       title: "SAP Finance Integration",    description: "Bi-directional cost posting to SAP",             owner: "Integration Lead","status": "In Progress","notes": "Mapping complete; testing in dev.","createdAt": "2025-03-05T09:00:00.000Z" },
  { id: 8,  projectId: 1, category: "Integrations",       title: "AD/LDAP User Sync",          description: "Sync Active Directory users and roles",          owner: "IT Team",        status: "Complete",    notes: "Runs nightly.",                    createdAt: "2025-03-10T09:00:00.000Z" },
  { id: 9,  projectId: 1, category: "Reporting",          title: "Executive KPI Dashboard",    description: "Build space utilisation KPI dashboard",          owner: "Tyler Travis",   status: "Not Started", notes: "",                                 createdAt: "2025-04-01T09:00:00.000Z" },
  { id: 10, projectId: 1, category: "Reporting",          title: "Work Order Analytics Report","description": "Monthly WO volume & cost trend report",        owner: "QA Team",        status: "Not Started", notes: "",                                 createdAt: "2025-04-05T09:00:00.000Z" },
];

let uatScenarios: UatScenario[] = [
  { id: 1, projectId: 1, title: "Create & Dispatch Work Order",  description: "Create a P1 corrective WO and verify it routes to the correct trade.",            tester: "Maria Kowalski", priority: "High",   status: "Passed",     notes: "Passed on first run.",          createdAt: "2025-05-01T09:00:00.000Z" },
  { id: 2, projectId: 1, title: "Space Allocation Move Request", description: "Submit a move request and confirm occupancy data updates in real time.",          tester: "James Lee",      priority: "High",   status: "Passed",     notes: "",                              createdAt: "2025-05-03T09:00:00.000Z" },
  { id: 3, projectId: 1, title: "SAP Cost Posting Validation",   description: "Complete a WO and confirm costs post to correct SAP cost centre.",                tester: "Maria Kowalski", priority: "High",   status: "Failed",     notes: "Cost centre mapping error — DEF-42 raised.", createdAt: "2025-05-05T09:00:00.000Z" },
  { id: 4, projectId: 1, title: "Preventive Maintenance Schedule","description":"Verify PM schedule auto-generates WOs on the correct trigger dates.",           tester: "James Lee",      priority: "Medium", status: "In Testing", notes: "Partially verified.",           createdAt: "2025-05-08T09:00:00.000Z" },
  { id: 5, projectId: 1, title: "Floor Plan Viewer",             description: "Navigate floor plan, select a room, and view current occupant details.",          tester: "Anna Reyes",     priority: "Medium", status: "Passed",     notes: "",                              createdAt: "2025-05-10T09:00:00.000Z" },
  { id: 6, projectId: 1, title: "SLA Escalation Notification",   description: "Let a P2 WO breach SLA and confirm manager receives escalation email.",           tester: "Anna Reyes",     priority: "Medium", status: "Not Started","notes": "",                            createdAt: "2025-05-12T09:00:00.000Z" },
  { id: 7, projectId: 1, title: "Role-Based Access Control",     description: "Verify requestor, technician, and manager roles see correct UI and data.",        tester: "IT Team",        priority: "High",   status: "Not Started","notes": "",                            createdAt: "2025-05-14T09:00:00.000Z" },
];

let projectStatuses: ProjectStatus[] = [
  {
    id: 1,
    projectId: 1,
    ragStatus: "Amber",
    weeklyUpdate: "Configuration is progressing well — 70% complete across all modules. The SAP integration encountered a cost-centre mapping issue (DEF-42) which is being resolved by the integration team; estimated fix by end of week. UAT preparation is on track for the July 25 start date. Risk: dependency on SAP team availability over the next two sprints.",
    updatedAt: "2025-06-09T08:00:00.000Z",
  },
];

let nextId = { project: 2, milestone: 7, workbook: 11, uat: 8, status: 2 };

const PHASES = [
  "Discovery",
  "Requirements",
  "Configuration",
  "UAT",
  "Sign-Off",
  "Go-Live",
];

function now() {
  return new Date().toISOString();
}

function seedMilestones(projectId: number) {
  PHASES.forEach((phase, idx) => {
    milestones.push({
      id: nextId.milestone++,
      projectId,
      phase,
      status: "Not Started",
      owner: "",
      targetDate: "",
      completedDate: "",
      notes: "",
      sortOrder: idx,
    });
  });
}

function seedStatus(projectId: number) {
  projectStatuses.push({
    id: nextId.status++,
    projectId,
    ragStatus: "Green",
    weeklyUpdate: "",
    updatedAt: now(),
  });
}

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Projects ──────────────────────────────────────────────────────────────────

app.get("/api/projects", (_req, res) => {
  res.json([...projects].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
});

app.post("/api/projects", (req, res) => {
  const { name, client, system, sponsor, startDate, targetGoLive, complexity } =
    req.body;
  const project: Project = {
    id: nextId.project++,
    name,
    client,
    system,
    sponsor,
    startDate,
    targetGoLive,
    complexity,
    createdAt: now(),
    updatedAt: now(),
  };
  projects.push(project);
  seedMilestones(project.id);
  seedStatus(project.id);
  res.status(201).json(project);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find((p) => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

app.put("/api/projects/:id", (req, res) => {
  const idx = projects.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { name, client, system, sponsor, startDate, targetGoLive, complexity } =
    req.body;
  projects[idx] = {
    ...projects[idx],
    name,
    client,
    system,
    sponsor,
    startDate,
    targetGoLive,
    complexity,
    updatedAt: now(),
  };
  res.json(projects[idx]);
});

// ── Workbook ──────────────────────────────────────────────────────────────────

app.get("/api/projects/:projectId/workbook", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  res.json(
    workbookItems
      .filter((i) => i.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );
});

app.post("/api/projects/:projectId/workbook", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { category, title, description, owner, status, notes } = req.body;
  const item: WorkbookItem = {
    id: nextId.workbook++,
    projectId,
    category,
    title,
    description,
    owner,
    status,
    notes: notes || "",
    createdAt: now(),
  };
  workbookItems.push(item);
  res.status(201).json(item);
});

app.put("/api/projects/:projectId/workbook/:id", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const idx = workbookItems.findIndex(
    (i) => i.id === id && i.projectId === projectId
  );
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { category, title, description, owner, status, notes } = req.body;
  workbookItems[idx] = {
    ...workbookItems[idx],
    category,
    title,
    description,
    owner,
    status,
    notes: notes || "",
  };
  res.json(workbookItems[idx]);
});

app.delete("/api/projects/:projectId/workbook/:id", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  workbookItems = workbookItems.filter(
    (i) => !(i.id === id && i.projectId === projectId)
  );
  res.status(204).end();
});

// ── Milestones ────────────────────────────────────────────────────────────────

app.get("/api/projects/:projectId/milestones", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  res.json(
    milestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
});

app.put("/api/projects/:projectId/milestones/:id", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const idx = milestones.findIndex(
    (m) => m.id === id && m.projectId === projectId
  );
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { status, owner, targetDate, completedDate, notes } = req.body;
  if (status !== undefined) milestones[idx].status = status;
  if (owner !== undefined) milestones[idx].owner = owner;
  if (targetDate !== undefined) milestones[idx].targetDate = targetDate;
  if (completedDate !== undefined) milestones[idx].completedDate = completedDate;
  if (notes !== undefined) milestones[idx].notes = notes;
  res.json(milestones[idx]);
});

// ── UAT ───────────────────────────────────────────────────────────────────────

app.get("/api/projects/:projectId/uat", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  res.json(
    uatScenarios
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );
});

app.post("/api/projects/:projectId/uat", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { title, description, tester, priority, status, notes } = req.body;
  const scenario: UatScenario = {
    id: nextId.uat++,
    projectId,
    title,
    description,
    tester,
    priority,
    status,
    notes: notes || "",
    createdAt: now(),
  };
  uatScenarios.push(scenario);
  res.status(201).json(scenario);
});

app.put("/api/projects/:projectId/uat/:id", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  const idx = uatScenarios.findIndex(
    (s) => s.id === id && s.projectId === projectId
  );
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { title, description, tester, priority, status, notes } = req.body;
  if (title !== undefined) uatScenarios[idx].title = title;
  if (description !== undefined) uatScenarios[idx].description = description;
  if (tester !== undefined) uatScenarios[idx].tester = tester;
  if (priority !== undefined) uatScenarios[idx].priority = priority;
  if (status !== undefined) uatScenarios[idx].status = status;
  if (notes !== undefined) uatScenarios[idx].notes = notes;
  res.json(uatScenarios[idx]);
});

app.delete("/api/projects/:projectId/uat/:id", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const id = parseInt(req.params.id);
  uatScenarios = uatScenarios.filter(
    (s) => !(s.id === id && s.projectId === projectId)
  );
  res.status(204).end();
});

// ── Status ────────────────────────────────────────────────────────────────────

app.get("/api/projects/:projectId/status", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const status = projectStatuses.find((s) => s.projectId === projectId);
  if (!status) return res.status(404).json({ error: "Not found" });
  res.json(status);
});

app.put("/api/projects/:projectId/status", (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const { ragStatus, weeklyUpdate } = req.body;
  const idx = projectStatuses.findIndex((s) => s.projectId === projectId);
  if (idx === -1) {
    const created: ProjectStatus = {
      id: nextId.status++,
      projectId,
      ragStatus,
      weeklyUpdate,
      updatedAt: now(),
    };
    projectStatuses.push(created);
    return res.json(created);
  }
  projectStatuses[idx] = {
    ...projectStatuses[idx],
    ragStatus,
    weeklyUpdate,
    updatedAt: now(),
  };
  res.json(projectStatuses[idx]);
});

// Start server when run directly (not imported by Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

export default app;
