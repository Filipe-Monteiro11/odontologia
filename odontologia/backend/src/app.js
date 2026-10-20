import express from "express";
import cors from "cors";

const app = express();

// Permitir requisições do frontend
app.use(cors({
  origin: "http://localhost:5173"
}));

// Permitir receber JSON
app.use(express.json());

// Rota de teste
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API da Dra. Vitória Delgado funcionando!"
  });
});

export default app;
