import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import workbookRouter from "./workbook";
import milestonesRouter from "./milestones";
import uatRouter from "./uat";
import statusRouter from "./status";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/projects/:projectId/workbook", workbookRouter);
router.use("/projects/:projectId/milestones", milestonesRouter);
router.use("/projects/:projectId/uat", uatRouter);
router.use("/projects/:projectId/status", statusRouter);

export default router;
