import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";
import { api } from "../services/api.js";
import "../styles/adminAppointments.css";

const TIME_ZONE = "America/Recife";

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    dateStyle: "long",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  return status;
}

function AppointmentDetails({ appointment, onClose, onCancel, canceling }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !canceling) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, canceling]);

  const { patient, service } = appointment;

  return (
    <div
      className="appointment-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !canceling) {
          onClose();
        }
      }}
    >
      <section
        className="appointment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-title"
      >
        <header className="appointment-modal-header">
          <div>
            <span className="appointment-label">DETALHES DA CONSULTA</span>
            <h2 id="appointment-title">Consulta #{appointment.id}</h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="appointment-close"
            onClick={onClose}
            disabled={canceling}
            aria-label="Fechar detalhes"
          >
            <X size={19} />
          </button>
        </header>

        <div className="appointment-modal-body">
          <span
            className={`appointment-status ${
              appointment.status === "confirmed" ? "confirmed" : "canceled"
            }`}
          >
            {statusLabel(appointment.status)}
          </span>

          <section className="appointment-detail-section">
            <h3>Dados do paciente</h3>

            <dl className="appointment-detail-list">
              <div>
                <dt>Nome</dt>
                <dd>{patient.name}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>
                  <a href={`tel:${patient.phone.replace(/\D/g, "")}`}>
                    <Phone size={15} />
                    {patient.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>
                  {patient.email ? (
                    <a href={`mailto:${patient.email}`}>
                      <Mail size={15} />
                      {patient.email}
                    </a>
                  ) : (
                    "Não informado"
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="appointment-detail-section">
            <h3>Informações do agendamento</h3>

            <dl className="appointment-detail-list">
              <div>
                <dt>Procedimento</dt>
                <dd>{service.name}</dd>
              </div>
              <div>
                <dt>Data da consulta</dt>
                <dd>{formatDate(appointment.startAt)}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>
                  {formatTime(appointment.startAt)} às{" "}
                  {formatTime(appointment.endAt)}
                </dd>
              </div>
              <div>
                <dt>Agendado em</dt>
                <dd>
                  {formatDate(appointment.createdAt)}, às{" "}
                  {formatTime(appointment.createdAt)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className="appointment-modal-footer">
          <button
            type="button"
            className="appointment-dismiss"
            onClick={onClose}
            disabled={canceling}
          >
            Fechar
          </button>

          {appointment.status === "confirmed" && (
            <button
              type="button"
              className="appointment-cancel"
              disabled={canceling}
              onClick={() => onCancel(appointment)}
            >
              {canceling ? "Cancelando..." : "Cancelar consulta"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

export default function AdminAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const closeDetails = useCallback(() => setSelected(null), []);

  const handleError = useCallback(
    (err) => {
      if (
        [
          "Autenticação necessária.",
          "Sessão inválida ou expirada.",
          "Administrador não encontrado.",
        ].includes(err.message)
      ) {
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

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await api("/api/admin/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) setAppointments(result.appointments);
      } catch (err) {
        if (active) handleError(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [navigate, refreshKey, handleError]);

  async function cancelAppointment(appointment) {
    if (
      !window.confirm(
        `Cancelar a consulta de ${appointment.patient.name}?\n\nO paciente não será avisado automaticamente.`
      )
    ) {
      return;
    }

    setCanceling(true);
    setError("");
    setMessage("");

    try {
      const token = sessionStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      await api(`/api/admin/appointments/${appointment.id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setSelected(null);
      setMessage("Consulta cancelada com sucesso.");
    } catch (err) {
      handleError(err);
    } finally {
      setCanceling(false);
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
            Visualize todos os agendamentos e clique em uma consulta
            para acessar os dados do paciente.
          </p>
        </div>

        <section className="appointments-panel">
          <div className="appointments-toolbar">
            <div className="appointments-total">
              <CalendarDays size={21} />
              <div>
                <h2>Todos os agendamentos</h2>
                <p>
                  {loading
                    ? "Carregando..."
                    : `${appointments.length} registro(s) · ${confirmedCount} confirmado(s)`}
                </p>
              </div>
            </div>

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

          {loading ? (
            <div className="appointments-empty" role="status">
              Carregando consultas...
            </div>
          ) : appointments.length === 0 ? (
            <div className="appointments-empty">
              Nenhum agendamento cadastrado.
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <button
                  type="button"
                  key={appointment.id}
                  className="appointment-entry"
                  onClick={() => setSelected(appointment)}
                >
                  <span className="appointment-entry-time">
                    <Clock3 size={17} />
                    <span>
                      <strong>{formatShortDate(appointment.startAt)}</strong>
                      <small>{formatTime(appointment.startAt)}</small>
                    </span>
                  </span>

                  <span className="appointment-entry-info">
                    <strong>{appointment.patient.name}</strong>
                    <small>{appointment.service.name}</small>
                  </span>

                  <span
                    className={`appointment-status ${
                      appointment.status === "confirmed"
                        ? "confirmed"
                        : "canceled"
                    }`}
                  >
                    {statusLabel(appointment.status)}
                  </span>

                  <span className="appointment-entry-link">
                    Ver detalhes →
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {selected && (
        <AppointmentDetails
          appointment={selected}
          onClose={closeDetails}
          onCancel={cancelAppointment}
          canceling={canceling}
        />
      )}
    </div>
  );
}