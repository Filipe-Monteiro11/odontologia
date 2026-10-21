import { Router } from "express";
import rateLimit from "express-rate-limit";
import { storeAppointment } from "../controllers/appointmentController.js";

const router = Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas. Aguarde alguns minutos.",
  },
});

router.post("/", bookingLimiter, storeAppointment);

export default router;
