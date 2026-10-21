import { AppointmentError } from "../services/appointmentService.js";

export function errorHandler(error, req, res, next) {
  if (error instanceof AppointmentError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error.message === "Horário já reservado." ||
    error.message === "Horário bloqueado."
  ) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  const expectedMessages = [
    "Serviço inválido.",
    "Data inválida.",
    "O horário precisa estar no futuro.",
    "Serviço indisponível.",
    "Duração do serviço inválida.",
    "O atendimento não pode atravessar a meia-noite.",
    "Horário fora do expediente.",
    "Horário de expediente inválido.",
  ];

  if (expectedMessages.includes(error.message)) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Erro interno:", error);

  return res.status(500).json({
    success: false,
    message: "Não foi possível concluir a solicitação.",
  });
}
