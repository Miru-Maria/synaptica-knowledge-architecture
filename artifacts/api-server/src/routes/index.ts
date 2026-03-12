import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import knowledgeRouter from "./knowledge/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/knowledge", knowledgeRouter);

export default router;
