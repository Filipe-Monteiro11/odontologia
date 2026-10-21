import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";

import {
  listBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
} from "../controllers/adminBlockedSlotController.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listBlockedSlots);
router.post("/", createBlockedSlot);
router.delete("/:id", deleteBlockedSlot);

export default router;