import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, CalendarOff, ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp, Clock3, Plus, Save, Trash2,
} from "lucide-react";
import { api } from "../services/api.js";
import "../styles/adminAvailability.css";

const DAYS = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];
const ZONE = "America/Recife";
const INITIAL_BLOCK = {
  startDate: "", endDate: "", startTime: "09:00", endTime: "12:00", reason: "",
};
const AUTH_ERRORS = [
  "Autenticação necessária.", "Sessão inválida ou expirada.",
  "Sessão expirada. Faça login novamente.", "Token de autenticação inválido.",
  "Sessão inválida. Faça login novamente.", "Administrador não encontrado.",
];

function todayInRecife() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function displayDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function displayDateTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ZONE, dateStyle: "short", timeStyle: "short",
  }).format(new Date(date));
}

function newWeek() {
  return DAYS.map((name, weekday) => ({ name, weekday, periods: [] }));
}

function minutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function adjustTime(time, step) {
  const total = Math.max(0, Math.min(1439, minutes(time) + step));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function TimeControl({ label, value, onChange }) {
  return (
    <div className="time-control">
      <input type="time" aria-label={label} value={value}
        onChange={(event) => onChange(event.target.value)} />
      <div className="time-arrows">
        <button type="button" aria-label={`Aumentar ${label} em 30 minutos`}
          disabled={!value || minutes(value) >= 1439}
          onClick={() => onChange(adjustTime(value, 30))}>
          <ChevronUp size={15} />
        </button>
        <button type="button" aria-label={`Diminuir ${label} em 30 minutos`}
          disabled={!value || minutes(value) === 0}
          onClick={() => onChange(adjustTime(value, -30))}>
          <ChevronDown size={15} />
        </button>
      </div>
    </div>
  );
}

function DatePicker({ label, value, minDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState((value || minDate).slice(0, 7));
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [year, month] = visibleMonth.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const blanks = (firstDay.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const title = new Intl.DateTimeFormat("pt-BR", {
    month: "long", timeZone: "UTC",
  }).format(firstDay);

  function moveMonth(amount) {
    const next = new Date(Date.UTC(year, month - 1 + amount, 1));
    setVisibleMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  function toggle() {
    if (!open) setVisibleMonth((value && value >= minDate ? value : minDate).slice(0, 7));
    setOpen(!open);
  }

  return (
    <div className="date-picker" ref={root}>
      <span className="field-label">{label}</span>
      <button type="button" className="date-picker-trigger" onClick={toggle}
        aria-expanded={open} aria-label={`${label}: ${value ? displayDate(value) : "não selecionada"}`}>
        <span>{value ? displayDate(value) : "Selecionar data"}</span>
        <CalendarDays size={18} />
      </button>
      {open && (
        <div className="date-picker-popup">
          <div className="date-picker-header">
            <strong>{title}</strong>
            <div className="date-picker-navigation">
              <button type="button" aria-label="Mês anterior"
                disabled={visibleMonth <= minDate.slice(0, 7)}
                onClick={() => moveMonth(-1)}><ChevronLeft size={18} /></button>
              <button type="button" aria-label="Próximo mês"
                onClick={() => moveMonth(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="date-picker-grid">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <span key={day} className="date-picker-weekday">{day}</span>
            ))}
            {Array.from({ length: blanks }, (_, i) => (
              <span key={`blank-${i}`} aria-hidden="true" />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = `${visibleMonth}-${String(i + 1).padStart(2, "0")}`;
              return (
                <button key={date} type="button" disabled={date < minDate}
                  className={`date-picker-day ${date === value ? "selected" : ""}`}
                  aria-label={displayDate(date)} aria-pressed={date === value}
                  onClick={() => { onChange(date); setOpen(false); }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAvailability() {
  const navigate = useNavigate();
  const [week, setWeek] = useState(newWeek);
  const [blocks, setBlocks] = useState([]);
  const [block, setBlock] = useState(INITIAL_BLOCK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const today = todayInRecife();

  function request(path, options = {}) {
    const token = sessionStorage.getItem("adminToken");
    if (!token) throw new Error("Autenticação necessária.");
    return api(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  function reportError(error) {
    if (AUTH_ERRORS.includes(error.message)) {
      sessionStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
    } else {
      setNotice({ type: "error", text: error.message === "Failed to fetch"
        ? "Não foi possível conectar ao servidor." : error.message });
    }
  }

  useEffect(() => {
    if (!sessionStorage.getItem("adminToken")) {
      navigate("/admin/login", { replace: true });
      return;
    }
    let mounted = true;
    Promise.all([
      request("/api/admin/availability"),
      request("/api/admin/blocked-slots"),
    ]).then(([availability, blocked]) => {
      if (!mounted) return;
      const days = newWeek();
      availability.periods.forEach(({ weekday, startTime, endTime }) => {
        days[weekday].periods.push({ startTime, endTime });
      });
      setWeek(days);
      setBlocks(blocked.blockedSlots);
    }).catch((error) => { if (mounted) reportError(error); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [navigate]);

  function changePeriods(weekday, update) {
    setWeek((current) => current.map((day) => day.weekday === weekday
      ? { ...day, periods: update(day.periods) } : day));
  }

  function editPeriod(weekday, index, field, value) {
    changePeriods(weekday, (periods) => periods.map((period, i) =>
      i === index ? { ...period, [field]: value } : period));
  }

  function addPeriod(weekday) {
    changePeriods(weekday, (periods) => [...periods, {
      startTime: periods.length ? periods[periods.length - 1].endTime : "09:00",
      endTime: periods.length ? adjustTime(periods[periods.length - 1].endTime, 60) : "12:00",
    }]);
  }

  function saveBlockField(field, value) {
    setBlock((previous) => {
      const next = { ...previous, [field]: value };
      if (field === "startDate" && next.endDate && next.endDate < value) {
        next.endDate = value;
      }
      return next;
    });
  }

  async function saveWeek() {
    setNotice(null);
    const periods = week.flatMap(({ weekday, periods }) =>
      periods.map((period) => ({ weekday, ...period })));
    for (const day of week) {
      const sorted = [...day.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (sorted.some((p) => !p.startTime || !p.endTime || p.startTime >= p.endTime) ||
        sorted.some((p, i) => i > 0 && p.startTime < sorted[i - 1].endTime)) {
        setNotice({ type: "error", text: `Horários inválidos ou sobrepostos em ${day.name}.` });
        return;
      }
    }
    if (!window.confirm("Salvar expediente? Consultas existentes não serão alteradas automaticamente.")) return;
    setSaving(true);
    try {
      await request("/api/admin/availability", {
        method: "PUT", body: JSON.stringify({ periods }),
      });
      setNotice({ type: "success", text: "Expediente atualizado." });
    } catch (error) { reportError(error); }
    finally { setSaving(false); }
  }

  async function createBlock(event) {
    event.preventDefault();
    setNotice(null);
    const { startDate, startTime, endDate, endTime, reason } = block;
    if (!startDate || !startTime || !endDate || !endTime) {
      setNotice({ type: "error", text: "Informe datas e horários do bloqueio." });
      return;
    }
    const startAt = `${startDate}T${startTime}:00-03:00`;
    const endAt = `${endDate}T${endTime}:00-03:00`;
    if (new Date(startAt) <= new Date() || new Date(endAt) <= new Date(startAt)) {
      setNotice({ type: "error", text: "O período deve ser futuro, com término após o início." });
      return;
    }
    if (!window.confirm("Confirmar bloqueio? Consultas existentes não serão canceladas.")) return;
    setBlocking(true);
    try {
      const result = await request("/api/admin/blocked-slots", {
        method: "POST", body: JSON.stringify({
          startAt, endAt, reason: reason.trim() || undefined,
        }),
      });
      setBlocks((current) => [...current, result.blockedSlot]
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)));
      setBlock(INITIAL_BLOCK);
      setNotice({ type: "success", text: "Bloqueio adicionado." });
    } catch (error) { reportError(error); }
    finally { setBlocking(false); }
  }

  async function deleteBlock(id) {
    if (!window.confirm("Remover este bloqueio?")) return;
    setNotice(null);
    setDeletingId(id);
    try {
      await request(`/api/admin/blocked-slots/${id}`, { method: "DELETE" });
      setBlocks((current) => current.filter((item) => item.id !== id));
      setNotice({ type: "success", text: "Bloqueio removido." });
    } catch (error) { reportError(error); }
    finally { setDeletingId(null); }
  }

  if (loading) return <main className="admin-loading" role="status">Carregando disponibilidade...</main>;

  return (
    <div className="availability-page">
      <header className="availability-header">
        <div className="container availability-header-content">
          <strong>ODONTOLOGIA · ADMINISTRAÇÃO</strong>
          <Link to="/admin"><ArrowLeft size={17} /> Voltar ao painel</Link>
        </div>
      </header>

      <main className="container availability-main">
        <div className="availability-heading">
          <span>GERENCIAMENTO DA AGENDA</span>
          <h1>Disponibilidade</h1>
          <p>Defina o expediente semanal e os períodos indisponíveis.</p>
        </div>

        {notice && <p className={`availability-alert ${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>}

        <section className="availability-section">
          <div className="availability-section-title">
            <Clock3 size={22} />
            <div><h2>Expediente semanal</h2><p>Ajuste os horários com as setas ou digitando.</p></div>
          </div>
          {week.map(({ name, weekday, periods }) => (
            <div className="week-day" key={weekday}>
              <div className="week-day-name">
                <strong>{name}</strong><span>{periods.length ? "Atendimento" : "Fechado"}</span>
              </div>
              <div className="week-periods">
                {periods.map((period, index) => (
                  <div className="week-period" key={`${weekday}-${index}`}>
                    <TimeControl label={`Início - ${name}`} value={period.startTime}
                      onChange={(value) => editPeriod(weekday, index, "startTime", value)} />
                    <span>até</span>
                    <TimeControl label={`Fim - ${name}`} value={period.endTime}
                      onChange={(value) => editPeriod(weekday, index, "endTime", value)} />
                    <button type="button" className="icon-button"
                      aria-label={`Remover período de ${name}`}
                      onClick={() => changePeriods(weekday, (current) => current.filter((_, i) => i !== index))}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-period" onClick={() => addPeriod(weekday)}>
                  <Plus size={16} /> Adicionar período
                </button>
              </div>
            </div>
          ))}
          <div className="availability-actions">
            <button type="button" className="availability-primary" disabled={saving} onClick={saveWeek}>
              <Save size={17} /> {saving ? "Salvando..." : "Salvar expediente"}
            </button>
          </div>
        </section>

        <section className="availability-section">
          <div className="availability-section-title">
            <CalendarOff size={22} />
            <div><h2>Bloqueios de agenda</h2><p>Selecione dias e horários de folga ou ausência.</p></div>
          </div>
          <form className="block-form" onSubmit={createBlock}>
            <DatePicker label="Data de início" value={block.startDate} minDate={today}
              onChange={(value) => saveBlockField("startDate", value)} />
            <DatePicker label="Data de término" value={block.endDate}
              minDate={block.startDate && block.startDate > today ? block.startDate : today}
              onChange={(value) => saveBlockField("endDate", value)} />
            <div className="block-field">
              <span className="field-label">Horário de início</span>
              <TimeControl label="Horário de início" value={block.startTime}
                onChange={(value) => saveBlockField("startTime", value)} />
            </div>
            <div className="block-field">
              <span className="field-label">Horário de término</span>
              <TimeControl label="Horário de término" value={block.endTime}
                onChange={(value) => saveBlockField("endTime", value)} />
            </div>
            <label className="block-reason">
              Motivo (opcional)
              <input type="text" maxLength={200} placeholder="Ex.: Férias"
                value={block.reason} onChange={(event) => saveBlockField("reason", event.target.value)} />
            </label>
            <div className="block-submit">
              <button className="availability-primary" type="submit" disabled={blocking}>
                <Plus size={17} /> {blocking ? "Adicionando..." : "Adicionar bloqueio"}
              </button>
            </div>
          </form>

          <h3 className="blocks-heading">Bloqueios cadastrados</h3>
          {blocks.length === 0 ? (
            <p className="empty-blocks">Nenhum bloqueio futuro cadastrado.</p>
          ) : (
            <div className="block-list">
              {blocks.map((item) => (
                <div className="block-item" key={item.id}>
                  <div>
                    <strong>{displayDateTime(item.startAt)} até {displayDateTime(item.endAt)}</strong>
                    <span>{item.reason || "Sem motivo informado"}</span>
                  </div>
                  <button type="button" className="icon-button" disabled={deletingId === item.id}
                    aria-label="Remover bloqueio" onClick={() => deleteBlock(item.id)}>
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