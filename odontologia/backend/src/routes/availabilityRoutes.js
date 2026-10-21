import { Router } from "express";
import { listAvailableSlots } from "../controllers/availabilityController.js";

const router = Router();

router.get("/", listAvailableSlots);

export default router;
