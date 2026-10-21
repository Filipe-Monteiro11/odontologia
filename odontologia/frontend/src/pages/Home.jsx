import {
  ArrowRight,
  Clock3,
  Instagram,
  MapPin,
  Phone,
} from "lucide-react";

const whatsapp = "https://wa.me/5581996592005";
const instagram = "https://instagram.com/dentista.aliciakorinfsky";
const maps = "https://www.google.com/maps/search/?api=1&query=Rua+Vila+Nova+622+Loja+29+Centro+Camaragibe+PE";

const services = [
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

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container header-content">
          <a href="#inicio" className="logo">
            ODONTOLOGIA
            <span>CLÍNICA & ESTÉTICA</span>
          </a>

          <nav aria-label="Menu principal">
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Tratamentos</a>
            <a href="#contato">Contato</a>
          </nav>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-dark header-cta"
          >
            Agendar consulta
            <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="eyebrow">
                CONSULTÓRIO ODONTOLÓGICO EM CAMARAGIBE
              </span>

              <h1>
                Cuidado e atenção
                <br />
                para o seu sorriso.
              </h1>

              <p>
                Atendimento odontológico para adultos e crianças,
                com tratamentos personalizados para cuidar da sua
                saúde bucal e da estética do seu sorriso.
              </p>

              <div className="hero-actions">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-dark"
                >
                  Agendar uma consulta
                  <ArrowRight size={18} />
                </a>

                <a href="#servicos" className="button button-outline">
                  Conhecer tratamentos
                </a>
              </div>

              <div className="location">
                <MapPin size={17} />
                Centro, Camaragibe - PE
              </div>
            </div>

            <aside className="appointment-card">
              <span className="eyebrow">ATENDIMENTO</span>
              <h2>Agende sua avaliação</h2>
              <p>
                Entre em contato para consultar a disponibilidade
                e receber informações sobre nossos tratamentos.
              </p>

              <div className="appointment-info">
                <Clock3 size={20} />
                <div>
                  <strong>Horário de funcionamento</strong>
                  <span>Segunda a sexta: 09h às 17h</span>
                  <span>Sábado: 09h às 12h</span>
                </div>
              </div>

              <div className="appointment-info">
                <Phone size={20} />
                <div>
                  <strong>Telefone / WhatsApp</strong>
                  <span>(81) 99659-2005</span>
                </div>
              </div>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link"
              >
                Falar pelo WhatsApp
                <ArrowRight size={17} />
              </a>
            </aside>
          </div>
        </section>

        <section className="section about" id="sobre">
          <div className="container about-content">
            <div>
              <span className="eyebrow">SOBRE O ATENDIMENTO</span>
              <h2>
                Um atendimento dedicado
                <br />
                à sua saúde bucal.
              </h2>
            </div>

            <p>
              Cada paciente possui necessidades diferentes.
              Por isso, valorizamos uma avaliação individualizada,
              com atenção à prevenção, ao tratamento e ao cuidado
              contínuo da saúde bucal.
            </p>
          </div>
        </section>

        <section className="section services" id="servicos">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">NOSSOS SERVIÇOS</span>
              <h2>Tratamentos odontológicos</h2>
              <p>
                Conheça os procedimentos disponíveis em nosso consultório.
              </p>
            </div>

            <div className="services-grid">
              {services.map((service) => (
                <div className="service-item" key={service}>
                  <h3>{service}</h3>
                  <ArrowRight size={18} />
                </div>
              ))}
            </div>

            <p className="disclaimer">
              Todos os procedimentos estão sujeitos à avaliação
              odontológica individual.
            </p>
          </div>
        </section>

        <section className="section contact" id="contato">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">CONTATO</span>
              <h2>Estamos à sua disposição</h2>
              <p>Entre em contato ou visite nosso consultório.</p>
            </div>

            <div className="contact-grid">
              <div className="contact-item">
                <Phone size={23} />
                <h3>Telefone / WhatsApp</h3>
                <p>(81) 99659-2005</p>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  Enviar mensagem <ArrowRight size={16} />
                </a>
              </div>

              <div className="contact-item">
                <Instagram size={23} />
                <h3>Instagram</h3>
                <p>@dentista.aliciakorinfsky</p>
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  Acessar perfil <ArrowRight size={16} />
                </a>
              </div>

              <div className="contact-item">
                <MapPin size={23} />
                <h3>Endereço</h3>
                <p>
                  Rua Vila Nova, 622, Loja 29
                  <br />
                  Centro, Camaragibe - PE
                </p>
                <a href={maps} target="_blank" rel="noopener noreferrer">
                  Ver localização <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="business-hours">
              <div>
                <Clock3 size={22} />
                <strong>Horário de funcionamento</strong>
              </div>

              <p>
                Segunda a sexta: 09h às 17h
                <br />
                Sábado: 09h às 12h
                <br />
                Domingo: fechado
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <strong>ODONTOLOGIA · CLÍNICA & ESTÉTICA</strong>
          <span>
            © {new Date().getFullYear()} — Camaragibe, PE
          </span>
        </div>
      </footer>
    </>
  );
}
