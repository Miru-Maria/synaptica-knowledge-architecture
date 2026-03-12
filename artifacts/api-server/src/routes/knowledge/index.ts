import { Router, type IRouter } from "express";
import searchRouter from "./search.js";
import gapsRouter from "./gaps.js";
import faqRouter from "./faq.js";
import promptsRouter from "./prompts.js";
import onboardingRouter from "./onboarding.js";

const router: IRouter = Router();

router.use(searchRouter);
router.use(gapsRouter);
router.use(faqRouter);
router.use(promptsRouter);
router.use(onboardingRouter);

export default router;
