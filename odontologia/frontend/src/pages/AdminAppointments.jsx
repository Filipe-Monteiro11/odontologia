import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { api } from "../services/api.js";
import "../styles/adminAppointments.css";

const TIME_ZONE = "America/Recife";

function todayInRecife() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) =>
    parts.find((part) => part.type === type).value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function isUnauthorized(message) {
  return [
    "Autenticação necessária.",
    "Sessão inválida ou expirada.",
    "Sessão expirada. Faça login novamente.",
    "Token de autenticação inválido.",
    "Sessão inválida. Faça login novamente.",
    "Administrador não encontrado.",
  ].includes(message);
}

export default function AdminAppointments() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayInRecife);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleError = useCallback(
    (err) => {
      if (isUnauthorized(err.message)) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        err.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor."
          : err.message
      );
    },
    [navigate]
  );

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let active = true;

    async function loadAppointments() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const result = await api(
          `/api/admin/appointments?date=${date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setAppointments(result.appointments);
        }
      } catch (err) {
        if (active) {
          setAppointments([]);
          handleError(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAppointments();

    return () => {
      active = false;
    };
  }, [date, refreshKey, navigate, handleError]);

  async function cancelAppointment(appointment) {
    const confirmed = window.confirm(
      `Cancelar a consulta de ${appointment.patient.name} em ${formatDate(appointment.startAt)}, às ${formatTime(appointment.startAt)}?\n\nEssa ação não avisa o paciente automaticamente.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setCancelingId(appointment.id);

    try {
      const token = sessionStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      await api(
        `/api/admin/appointments/${appointment.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setMessage("Consulta cancelada com sucesso.");
    } catch (err) {
      handleError(err);
    } finally {
      setCancelingId(null);
    }
  }

  const confirmedCount = appointments.filter(
    (item) => item.status === "confirmed"
  ).length;

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <div className="container appointments-header-inner">
          <strong>ODONTOLOGIA · ADMINISTRAÇÃO</strong>

          <Link to="/admin">
            <ArrowLeft size={17} />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="container appointments-main">
        <div className="appointments-heading">
          <span>GERENCIAMENTO DA AGENDA</span>
          <h1>Consultas</h1>
          <p>
            Visualize os agendamentos, consulte os dados dos
            pacientes e gerencie cancelamentos.
          </p>
        </div>

        <section className="appointments-panel">
          <div className="appointments-toolbar">
            <label className="appointments-date">
              Selecionar data
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="appointments-refresh"
              disabled={loading}
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>

          {error && (
            <p className="appointments-alert error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="appointments-alert success" role="status">
              {message}
            </p>
          )}

          <div className="appointments-results">
            <div>
              <h2>Agendamentos do dia</h2>
              <p>
                {loading
                  ? "Buscando consultas..."
                  : `${confirmedCount} consulta(s) confirmada(s)`}
              </p>
            </div>

            <CalendarDays size={22} />
          </div>

          {loading ? (
            <div className="appointments-empty" role="status">
              Carregando consultas...
            </div>
          ) : appointments.length === 0 ? (
            <div className="appointments-empty">
              Nenhuma consulta encontrada nesta data.
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => {
                const canceled =
                  appointment.status === "cancelled";

                return (
                  <article
                    className="appointment-card"
                    key={appointment.id}
                  >
                    <div className="appointment-top">
                      <div className="appointment-time">
                        <Clock3 size={18} />
                        <strong>
                          {formatTime(appointment.startAt)}
                          {" – "}
                          {formatTime(appointment.endAt)}
                        </strong>
                      </div>

                      <span
                        className={
                          canceled
                            ? "appointment-status canceled"
                            : "appointment-status confirmed"
                        }
                      >
                        {canceled
                          ? "Cancelada"
                          : appointment.status === "confirmed"
                            ? "Confirmada"
                            : appointment.status}
                      </span>
                    </div>

                    <div className="appointment-details">
                      <div>
                        <span>Paciente</span>
                        <h3>{appointment.patient.name}</h3>
                      </div>

                      <div>
                        <span>Procedimento</span>
                        <strong>{appointment.service.name}</strong>
                      </div>
                    </div>

                    <div className="appointment-contact">
                      <a
                        href={`tel:${appointment.patient.phone.replace(/\D/g, "")}`}
                      >
                        <Phone size={15} />
                        {appointment.patient.phone}
                      </a>

                      {appointment.patient.email && (
                        <a
                          href={`mailto:${appointment.patient.email}`}
                        >
                          <Mail size={15} />
                          {appointment.patient.email}
                        </a>
                      )}
                    </div>

                    {!canceled &&
                      appointment.status === "confirmed" && (
                        <div className="appointment-actions">
                          <button
                            type="button"
                            disabled={cancelingId === appointment.id}
                            onClick={() =>
                              cancelAppointment(appointment)
                            }
                          >
                            <XCircle size={16} />
                            {cancelingId === appointment.id
                              ? "Cancelando..."
                              : "Cancelar consulta"}
                          </button>
                        </div>
                      )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}