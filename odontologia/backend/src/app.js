import express from "express";
import cors from "cors";
import helmet from "helmet";
import serviceRoutes from "./routes/serviceRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminServiceRoutes from "./routes/adminServiceRoutes.js";

import appointmentRoutes from "./routes/appointmentRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API da Dra. Vitória Delgado funcionando!",
  });
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/admin/services", adminServiceRoutes);

app.use(errorHandler);

export default app;
