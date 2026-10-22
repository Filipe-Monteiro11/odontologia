import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import "../styles/booking.css";

const PROCEDURES = [
  {
    name: "Extrações",
    description: "Remoção de dentes quando indicada após avaliação clínica.",
    image: "/images/extracoes.png",
  },
  {
    name: "Restaurações",
    description: "Recuperação da estrutura e da função dos dentes.",
    image: "/images/restauracoes.png",
  },
  {
    name: "Aparelhos metálicos e estéticos",
    description: "Tratamentos ortodônticos para correção do alinhamento dental e da mordida.",
    image: "/images/aparelho-ortodontico.png",
  },
  {
    name: "Atendimento de crianças",
    description: "Cuidados odontológicos voltados à saúde bucal infantil.",
  },
  {
    name: "Tratamento de canal",
    description: "Tratamento da parte interna do dente, conforme avaliação clínica.",
    image: "/images/tratamento-de-canal.png",
  },
  {
    name: "Próteses dentárias",
    description: "Soluções para substituir dentes ausentes e recuperar a mastigação.",
    image: "/images/proteses.png",
  },
  {
    name: "Clareamento dental",
    description: "Tratamento estético para clarear os dentes com acompanhamento profissional.",
    image: "/images/clareamento-dental.png",
  },
  {
    name: "Cirurgias odontológicas",
    description: "Procedimentos cirúrgicos realizados conforme indicação clínica.",
    image: "/images/cirurgias-odontologicas.png",
  },
  {
    name: "Facetas dentárias",
    description: "Tratamentos estéticos para modificar a aparência dos dentes.",
    image: "/images/facetas-dentarias.png",
  },
  {
    name: "Harmonização facial (Botox)",
    description: "Procedimentos estéticos realizados após avaliação individual.",
    image: "/images/harmonizacao-facial-botox.png",
  },
  {
    name: "Limpeza dental",
    description: "Remoção profissional de placa e tártaro para manutenção da saúde bucal.",
    image: "/images/limpeza-dental.png",
  },
];

const WHATSAPP_NUMBER = "5581996592005";

export default function Booking() {
  const [selected, setSelected] = useState(null);

  const whatsappUrl = selected
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Olá! Gostaria de saber mais sobre o procedimento de ${selected.name} e conversar sobre um possível agendamento com a Dra. Alícia Korinfsky.`
      )}`
    : null;

  return (
    <div className="procedure-page">
      <header className="procedure-header">
        <div className="container procedure-header-inner">
          <Link
            to="/"
            className="procedure-brand"
            aria-label="Voltar à página inicial"
          >
            <img
              src="/images/logo-alicia.png"
              alt="Alícia Korinfsky"
            />
          </Link>

          <Link to="/" className="procedure-back">
            <ArrowLeft size={17} />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="container procedure-main">
        <div className="procedure-intro">
          <span>TRATAMENTOS ODONTOLÓGICOS</span>

          <h1>Encontre o cuidado que você procura</h1>

          <p>
            Conheça os procedimentos oferecidos pela Dra. Alícia Korinfsky.
            Selecione o tratamento de seu interesse e converse com nossa
            equipe para obter informações e combinar seu atendimento.
          </p>
        </div>

        <div className="procedure-grid">
          {PROCEDURES.map((procedure) => {
            const isSelected = selected?.name === procedure.name;

            return (
              <button
                key={procedure.name}
                type="button"
                className={`procedure-card${isSelected ? " is-selected" : ""}`}
                onClick={() => setSelected(procedure)}
                aria-pressed={isSelected}
              >
                {procedure.image ? (
                  <img
                    src={procedure.image}
                    alt={procedure.name}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="procedure-placeholder"
                    aria-hidden="true"
                  />
                )}

                <span className="procedure-card-body">
                  <span className="procedure-card-title">
                    <strong>{procedure.name}</strong>
                    {isSelected && <Check size={19} />}
                  </span>

                  <span className="procedure-description">
                    {procedure.description}
                  </span>

                  <span className="procedure-select">
                    {isSelected ? "Selecionado" : "Selecionar tratamento"}
                    <ArrowRight size={15} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <section className="procedure-footer">
          <div>
            <span className="procedure-footer-label">
              TRATAMENTO ESCOLHIDO
            </span>

            <h2>
              {selected?.name || "Selecione um procedimento acima"}
            </h2>

            <p>
              A data e o horário serão combinados diretamente com nossa equipe.
            </p>
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="procedure-cta"
            >
              <MessageCircle size={19} />
              Continuar pelo WhatsApp
              <ArrowRight size={17} />
            </a>
          ) : (
            <span className="procedure-cta is-disabled">
              <MessageCircle size={19} />
              Selecione um tratamento
            </span>
          )}
        </section>
      </main>
    </div>
  );
}