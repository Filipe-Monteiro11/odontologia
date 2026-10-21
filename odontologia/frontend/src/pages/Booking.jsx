
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";
import "../styles/booking.css";

const SERVICES = [
  "Extrações",
  "Restaurações",
  "Aparelhos metálicos e estéticos",
  "Atendimento de crianças",
  "Tratamento de canal",
  "Próteses dentárias",
  "Clareamento dental",
  "Cirurgias odontológicas",
  "Facetas dentárias",
  "Harmonização facial (Botox)",
];

const WHATSAPP = "https://wa.me/5581996592005";

function todayInRecife() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type).value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function isValidDate(date, today) {
  if (!date || date < today) return false;

  return new Date(`${date}T12:00:00Z`).getUTCDay() !== 0;
}

function Calendar({ date, onChange, today }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = new Date(`${today.slice(0, 7)}-01T12:00:00Z`);
  currentMonth.setUTCMonth(currentMonth.getUTCMonth() + monthOffset);

  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth();

  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  }).format(currentMonth);

  const daysInMonth = new Date(
    Date.UTC(year, month + 1, 0)
  ).getUTCDate();

  const firstWeekday = (currentMonth.getUTCDay() + 6) % 7;

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>{monthName}</h3>

        <div className="calendar-navigation">
          <button
            type="button"
            aria-label="Mês anterior"
            disabled={monthOffset === 0}
            onClick={() => setMonthOffset((value) => value - 1)}
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            aria-label="Próximo mês"
            onClick={() => setMonthOffset((value) => value + 1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
          (weekday) => (
            <span className="calendar-weekday" key={weekday}>
              {weekday}
            </span>
          )
        )}

        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} aria-hidden="true" />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;

          const value = [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0"),
          ].join("-");

          const sunday =
            new Date(Date.UTC(year, month, day)).getUTCDay() === 0;

          const disabled = value < today || sunday;

          return (
            <button
              key={value}
              type="button"
              className={`calendar-day ${date === value ? "selected" : ""}`}
              disabled={disabled}
              aria-label={formatDate(value)}
              aria-pressed={date === value}
              onClick={() => onChange(value)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Booking() {
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [step, setStep] = useState(1);

  const today = todayInRecife();
  const validDate = isValidDate(date, today);

  return (
    <div className="booking">
      <header className="booking-header">
        <div className="container booking-header-content">
          <Link to="/" className="booking-logo">
            ODONTOLOGIA
            <small>CLÍNICA & ESTÉTICA</small>
          </Link>

          <Link to="/" className="booking-back">
            <ArrowLeft size={17} />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="container booking-main">
        <div className="booking-intro">
          <span className="booking-label">AGENDAMENTO</span>
          <h1>Agende seu atendimento</h1>
          <p>
            Escolha o tratamento e informe a data desejada.
            A disponibilidade será confirmada pelo consultório.
          </p>
        </div>

        <div className="booking-layout">
          <section className="booking-card">
            <div className="booking-progress">
              <span className={step === 1 ? "active" : ""}>
                1. Tratamento
              </span>
              <span className={step === 2 ? "active" : ""}>
                2. Data
              </span>
            </div>

            {step === 1 ? (
              <div className="booking-content">
                <h2>Selecione o tratamento</h2>
                <p>Qual procedimento você procura?</p>

                <div className="booking-services">
                  {SERVICES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`booking-service ${service === item ? "selected" : ""}`}
                      onClick={() => setService(item)}
                      aria-pressed={service === item}
                    >
                      {item}
                      {service === item && <Check size={18} />}
                    </button>
                  ))}
                </div>

                <div className="booking-actions">
                  <button
                    type="button"
                    className="booking-button"
                    disabled={!service}
                    onClick={() => setStep(2)}
                  >
                    Continuar
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="booking-content">
                <h2>Escolha uma data</h2>
                <p>Selecione o dia em que gostaria de ser atendido.</p>

                <Calendar
                  date={date}
                  onChange={setDate}
                  today={today}
                />

                {validDate && (
                  <div className="booking-notice">
                    <strong>
                      Data selecionada: {formatDate(date)}
                    </strong>

                    <p>
                      A agenda online ainda está sendo configurada.
                      Consulte a disponibilidade pelo WhatsApp.
                    </p>

                    <a
                      href={WHATSAPP}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Consultar disponibilidade
                      <ArrowRight size={16} />
                    </a>
                  </div>
                )}

                <div className="booking-actions">
                  <button
                    type="button"
                    className="booking-back-button"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={17} />
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="booking-summary">
            <h3>Resumo do atendimento</h3>

            <div className="summary-item">
              <Check size={18} />
              <div>
                <span>Tratamento</span>
                <strong>{service || "Não selecionado"}</strong>
              </div>
            </div>

            <div className="summary-item">
              <CalendarDays size={18} />
              <div>
                <span>Data desejada</span>
                <strong>
                  {validDate ? formatDate(date) : "Não selecionada"}
                </strong>
              </div>
            </div>

            <div className="summary-item">
              <Clock3 size={18} />
              <div>
                <span>Horário</span>
                <strong>A confirmar</strong>
              </div>
            </div>

            <div className="summary-address">
              <MapPin size={18} />
              <span>
                Rua Vila Nova, 622, Loja 29
                <br />
                Centro, Camaragibe - PE
              </span>
            </div>

            <p className="summary-note">
              Nenhuma consulta foi reservada até o momento.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
