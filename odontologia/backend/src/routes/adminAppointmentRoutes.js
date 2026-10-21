import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";

import {
  listAdminAppointments,
  cancelAdminAppointment,
} from "../controllers/adminAppointmentController.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listAdminAppointments);
router.patch("/:id/cancel", cancelAdminAppointment);

export default router;