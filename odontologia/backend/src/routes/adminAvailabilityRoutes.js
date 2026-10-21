import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";

import {
  getAdminAvailability,
  updateAdminAvailability,
} from "../controllers/adminAvailabilityController.js";

const router = Router();

router.use(requireAdmin);

router.get("/", getAdminAvailability);
router.put("/", updateAdminAvailability);

export default router;