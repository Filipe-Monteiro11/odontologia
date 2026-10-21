import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";

import {
  listAdminServices,
  createAdminService,
  updateAdminService,
} from "../controllers/adminServiceController.js";

const router = Router();

// Todas as rotas deste arquivo exigem autenticação.
router.use(requireAdmin);

router.get("/", listAdminServices);
router.post("/", createAdminService);
router.patch("/:id", updateAdminService);

export default router;
