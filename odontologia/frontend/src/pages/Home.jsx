import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import "../styles/home.css";

const WHATSAPP = "https://wa.me/5581996592005";
const INSTAGRAM = "https://instagram.com/dentista.aliciakorinfsky";
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Rua+Vila+Nova+622+Loja+29+Centro+Camaragibe+PE";

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
  "Limpeza dental",
];

const GALLERY = Array.from({ length: 7 }, (_, index) => ({
  src: `/images/foto-${index + 1}.png`,
  alt: `Registro fotográfico odontológico ${index + 1}`,
}));

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="container home-header-inner">
          <a href="#inicio" className="home-brand" aria-label="Início">
            <img
              src="/images/logo-odonto.png"
              alt="Alícia Korinfsky"
            />
          </a>

          <nav className="home-nav" aria-label="Menu principal">
            <a href="#sobre">Sobre</a>
            <a href="#tratamentos">Tratamentos</a>
            <a href="#galeria">Galeria</a>
            <a href="#contato">Contato</a>
          </nav>

          <Link to="/agendar" className="home-button home-button-dark">
            Conhecer tratamentos
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <main>
        <section className="home-hero" id="inicio">
          <div className="container home-hero-grid">
            <div className="home-hero-text">
              <span className="home-eyebrow">
                ODONTOLOGIA EM CAMARAGIBE
              </span>

              <h1>
                Atenção e cuidado
                <br />
                para o seu sorriso.
              </h1>

              <p>
                Conheça os tratamentos oferecidos pela Dra. Alícia
                Korinfsky, com atendimento individualizado e atenção
                às suas necessidades.
              </p>

              <div className="home-actions">
                <Link
                  to="/agendar"
                  className="home-button home-button-dark"
                >
                  Ver procedimentos
                  <ArrowRight size={18} />
                </Link>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-button home-button-outline"
                >
                  <MessageCircle size={18} />
                  Falar pelo WhatsApp
                </a>
              </div>

              <div className="home-location">
                <MapPin size={17} />
                Centro, Camaragibe - PE
              </div>
            </div>

            <aside className="home-hero-panel">
              <span className="home-eyebrow">NOSSO ATENDIMENTO</span>

              <h2>Seu sorriso merece atenção.</h2>

              <p>
                Conheça os procedimentos disponíveis e converse
                diretamente com nossa equipe para esclarecer dúvidas
                e combinar seu atendimento.
              </p>

              <div className="home-hero-info">
                <Clock3 size={21} />
                <div>
                  <strong>Horário de funcionamento</strong>
                  <span>Segunda a sexta: 09h às 17h</span>
                  <span>Sábado: 09h às 12h</span>
                </div>
              </div>

              <div className="home-hero-info">
                <Phone size={21} />
                <div>
                  <strong>Telefone / WhatsApp</strong>
                  <span>(81) 99659-2005</span>
                </div>
              </div>

              <Link to="/agendar" className="home-panel-link">
                Explorar tratamentos
                <ArrowRight size={17} />
              </Link>
            </aside>
          </div>
        </section>

        <section className="home-section home-about" id="sobre">
          <div className="container home-about-grid">
            <div>
              <span className="home-eyebrow">SOBRE O ATENDIMENTO</span>

              <h2>
                Um cuidado pensado
                <br />
                para cada paciente.
              </h2>
            </div>

            <p>
              Cada pessoa possui necessidades diferentes. Por isso,
              a avaliação individual é essencial para orientar os
              cuidados com a saúde bucal e identificar os tratamentos
              mais adequados para cada situação.
            </p>
          </div>
        </section>

        <section
          className="home-section home-services"
          id="tratamentos"
        >
          <div className="container">
            <div className="home-section-heading">
              <span className="home-eyebrow">NOSSOS TRATAMENTOS</span>
              <h2>Cuidados para a sua saúde bucal</h2>
              <p>
                Conheça os procedimentos e saiba mais sobre
                os atendimentos disponíveis no consultório.
              </p>
            </div>

            <div className="home-services-grid">
              {SERVICES.map((service) => (
                <Link
                  key={service}
                  to="/agendar"
                  className="home-service"
                >
                  <span>{service}</span>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>

            <div className="home-section-action">
              <Link
                to="/agendar"
                className="home-button home-button-dark"
              >
                Ver detalhes dos procedimentos
                <ArrowRight size={17} />
              </Link>
            </div>

            <p className="home-disclaimer">
              A indicação dos procedimentos depende de avaliação
              odontológica individualizada.
            </p>
          </div>
        </section>

        <section className="home-section home-gallery" id="galeria">
          <div className="container">
            <div className="home-section-heading">
              <span className="home-eyebrow">GALERIA</span>
              <h2>Conheça nosso trabalho</h2>
              <p>
                Registros fotográficos dos cuidados e tratamentos
                odontológicos realizados.
              </p>
            </div>

            <div className="home-gallery-grid">
              {GALLERY.map((photo) => (
                <div className="home-gallery-item" key={photo.src}>
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <p className="home-gallery-note">
              Os resultados dos tratamentos variam conforme as
              características e necessidades de cada paciente.
            </p>
          </div>
        </section>

        <section className="home-section home-contact" id="contato">
          <div className="container">
            <div className="home-section-heading">
              <span className="home-eyebrow">CONTATO</span>
              <h2>Estamos à sua disposição</h2>
              <p>
                Entre em contato com nossa equipe ou conheça
                a localização do consultório.
              </p>
            </div>

            <div className="home-contact-grid">
              <div className="home-contact-card">
                <Phone size={23} />
                <h3>WhatsApp</h3>
                <p>(81) 99659-2005</p>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar mensagem
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="home-contact-card">
                <Camera size={23} />
                <h3>Instagram</h3>
                <p>@dentista.aliciakorinfsky</p>

                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acessar perfil
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="home-contact-card">
                <MapPin size={23} />
                <h3>Endereço</h3>
                <p>
                  Rua Vila Nova, 622, Loja 29
                  <br />
                  Centro, Camaragibe - PE
                </p>

                <a
                  href={MAPS}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver localização
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="home-hours">
              <div>
                <Clock3 size={21} />
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

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <strong>Dra. Alícia Korinfsky</strong>
          <span>
            © {new Date().getFullYear()} · Camaragibe, PE
          </span>
        </div>
      </footer>
    </div>
  );
}