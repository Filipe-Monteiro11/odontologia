
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarOff,
  Clock3,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { api } from "../services/api.js";
import "../styles/adminAvailability.css";

const DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const TIME_ZONE = "America/Recife";

function emptyWeek() {
  return DAYS.map((name, weekday) => ({
    name,
    weekday,
    periods: [],
  }));
}

function toLocalDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export default function AdminAvailability() {
  const navigate = useNavigate();

  const [week, setWeek] = useState(emptyWeek);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newBlock, setNewBlock] = useState({
    startAt: "",
    endAt: "",
    reason: "",
  });

  function request(path, options = {}) {
    const token = sessionStorage.getItem("adminToken");

    return api(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  function handleError(err) {
    if (
      err.message.includes("Autenticação") ||
      err.message.includes("Sessão") ||
      err.message.includes("Token")
    ) {
      sessionStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
      return;
    }

    setError(err.message);
  }

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let active = true;

    async function load() {
      try {
        const [availability, blocked] = await Promise.all([
          request("/api/admin/availability"),
          request("/api/admin/blocked-slots"),
        ]);

        if (!active) return;

        const days = emptyWeek();

        for (const period of availability.periods) {
          days[period.weekday].periods.push({
            startTime: period.startTime,
            endTime: period.endTime,
          });
        }

        setWeek(days);
        setBlocks(blocked.blockedSlots);
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
  }, [navigate]);

  function updatePeriod(weekday, index, field, value) {
    setWeek((current) =>
      current.map((day) => {
        if (day.weekday !== weekday) return day;

        return {
          ...day,
          periods: day.periods.map((period, i) =>
            i === index ? { ...period, [field]: value } : period
          ),
        };
      })
    );
  }

  function addPeriod(weekday) {
    setWeek((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              periods: [
                ...day.periods,
                { startTime: "09:00", endTime: "12:00" },
              ],
            }
          : day
      )
    );
  }

  function removePeriod(weekday, index) {
    setWeek((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              periods: day.periods.filter((_, i) => i !== index),
            }
          : day
      )
    );
  }

  async function saveWeek() {
    setError("");
    setMessage("");

    const periods = week.flatMap((day) =>
      day.periods.map((period) => ({
        weekday: day.weekday,
        ...period,
      }))
    );

    if (
      periods.some(
        ({ startTime, endTime }) =>
          !startTime || !endTime || startTime >= endTime
      )
    ) {
      setError("Confira os horários de início e término.");
      return;
    }

    if (
      !window.confirm(
        "Salvar o novo expediente? Consultas já confirmadas não serão alteradas automaticamente."
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      await request("/api/admin/availability", {
        method: "PUT",
        body: JSON.stringify({ periods }),
      });

      setMessage("Expediente atualizado com sucesso.");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  async function createBlock(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const start = new Date(`${newBlock.startAt}:00-03:00`);
    const end = new Date(`${newBlock.endAt}:00-03:00`);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start < new Date() ||
      end <= start
    ) {
      setError("Informe um período futuro com início anterior ao fim.");
      return;
    }

    if (
      !window.confirm(
        "Confirmar o bloqueio? Consultas existentes nesse período não serão canceladas."
      )
    ) {
      return;
    }

    setBlocking(true);

    try {
      const result = await request("/api/admin/blocked-slots", {
        method: "POST",
        body: JSON.stringify({
          startAt: `${newBlock.startAt}:00-03:00`,
          endAt: `${newBlock.endAt}:00-03:00`,
          reason: newBlock.reason.trim() || undefined,
        }),
      });

      setBlocks((current) =>
        [...current, result.blockedSlot].sort(
          (a, b) => new Date(a.startAt) - new Date(b.startAt)
        )
      );

      setNewBlock({ startAt: "", endAt: "", reason: "" });
      setMessage("Bloqueio adicionado com sucesso.");
    } catch (err) {
      handleError(err);
    } finally {
      setBlocking(false);
    }
  }

  async function deleteBlock(id) {
    if (!window.confirm("Remover este bloqueio?")) return;

    setError("");
    setMessage("");

    try {
      await request(`/api/admin/blocked-slots/${id}`, {
        method: "DELETE",
      });

      setBlocks((current) =>
        current.filter((block) => block.id !== id)
      );

      setMessage("Bloqueio removido com sucesso.");
    } catch (err) {
      handleError(err);
    }
  }

  if (loading) {
    return (
      <main className="admin-loading" role="status">
        Carregando disponibilidade...
      </main>
    );
  }

  return (
    <div className="availability-page">
      <header className="availability-header">
        <div className="container availability-header-content">
          <strong>ODONTOLOGIA · ADMINISTRAÇÃO</strong>

          <Link to="/admin">
            <ArrowLeft size={17} />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="container availability-main">
        <div className="availability-heading">
          <span>GERENCIAMENTO DA AGENDA</span>
          <h1>Disponibilidade</h1>
          <p>
            Configure o expediente semanal e os períodos em que
            o consultório não receberá agendamentos.
          </p>
        </div>

        {error && (
          <p className="availability-alert error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="availability-alert success" role="status">
            {message}
          </p>
        )}

        <section className="availability-section">
          <div className="availability-section-title">
            <Clock3 size={22} />
            <div>
              <h2>Expediente semanal</h2>
              <p>Adicione ou remova períodos de atendimento.</p>
            </div>
          </div>

          <div className="week-list">
            {week.map((day) => (
              <div className="week-day" key={day.weekday}>
                <div className="week-day-name">
                  <strong>{day.name}</strong>
                  <span>
                    {day.periods.length === 0
                      ? "Fechado"
                      : "Atendimento"}
                  </span>
                </div>

                <div className="week-periods">
                  {day.periods.map((period, index) => (
                    <div
                      className="week-period"
                      key={`${day.weekday}-${index}`}
                    >
                      <input
                        type="time"
                        aria-label={`Início - ${day.name}`}
                        value={period.startTime}
                        onChange={(event) =>
                          updatePeriod(
                            day.weekday,
                            index,
                            "startTime",
                            event.target.value
                          )
                        }
                      />

                      <span>até</span>

                      <input
                        type="time"
                        aria-label={`Fim - ${day.name}`}
                        value={period.endTime}
                        onChange={(event) =>
                          updatePeriod(
                            day.weekday,
                            index,
                            "endTime",
                            event.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remover período de ${day.name}`}
                        onClick={() =>
                          removePeriod(day.weekday, index)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-period"
                    onClick={() => addPeriod(day.weekday)}
                  >
                    <Plus size={16} />
                    Adicionar período
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="availability-actions">
            <button
              type="button"
              className="availability-primary"
              disabled={saving}
              onClick={saveWeek}
            >
              <Save size={17} />
              {saving ? "Salvando..." : "Salvar expediente"}
            </button>
          </div>
        </section>

        <section className="availability-section">
          <div className="availability-section-title">
            <CalendarOff size={22} />
            <div>
              <h2>Bloqueios de agenda</h2>
              <p>
                Cadastre folgas, feriados, férias ou horários
                indisponíveis.
              </p>
            </div>
          </div>

          <form className="block-form" onSubmit={createBlock}>
            <label>
              Início
              <input
                type="datetime-local"
                required
                value={newBlock.startAt}
                onChange={(event) =>
                  setNewBlock((current) => ({
                    ...current,
                    startAt: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Término
              <input
                type="datetime-local"
                required
                value={newBlock.endAt}
                onChange={(event) =>
                  setNewBlock((current) => ({
                    ...current,
                    endAt: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Motivo (opcional)
              <input
                type="text"
                maxLength={200}
                placeholder="Ex.: Férias"
                value={newBlock.reason}
                onChange={(event) =>
                  setNewBlock((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
              />
            </label>

            <button
              className="availability-primary"
              type="submit"
              disabled={blocking}
            >
              <Plus size={17} />
              {blocking ? "Adicionando..." : "Adicionar bloqueio"}
            </button>
          </form>

          <h3 className="blocks-heading">Bloqueios cadastrados</h3>

          {blocks.length === 0 ? (
            <p className="empty-blocks">
              Nenhum bloqueio futuro cadastrado.
            </p>
          ) : (
            <div className="block-list">
              {blocks.map((block) => (
                <div className="block-item" key={block.id}>
                  <div>
                    <strong>
                      {toLocalDateTime(block.startAt)}
                      {" até "}
                      {toLocalDateTime(block.endAt)}
                    </strong>
                    <span>{block.reason || "Sem motivo informado"}</span>
                  </div>

                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remover bloqueio"
                    onClick={() => deleteBlock(block.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
