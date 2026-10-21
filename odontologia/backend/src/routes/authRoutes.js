import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginAdmin } from "../controllers/authController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas de login. Aguarde alguns minutos.",
  },
});

router.post("/login", loginLimiter, loginAdmin);

router.get("/me", requireAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

export default router;
