import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, LogOut, Settings } from "lucide-react";
import { api } from "../services/api.js";
import "../styles/admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let active = true;

    api("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ admin }) => {
        if (active) setAdmin(admin);
      })
      .catch((err) => {
        if (!active) return;

        if (
          [
            "Autenticação necessária.",
            "Sessão inválida ou expirada.",
            "Sessão expirada. Faça login novamente.",
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
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  }

  if (!admin) {
    return (
      <main className="admin-loading" role="status">
        {error || "Verificando acesso..."}
      </main>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div className="container admin-dashboard-header-content">
          <div className="admin-brand">
            <strong>ODONTOLOGIA</strong>
            <span>PAINEL ADMINISTRATIVO</span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={logout}
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <main className="container admin-dashboard-main">
        <div className="admin-welcome">
          <span className="admin-eyebrow">VISÃO GERAL</span>
          <h1>Olá, {admin.name}</h1>
          <p>Gerencie as informações e a agenda do consultório.</p>
        </div>

        <div className="admin-dashboard-grid">
          <Link
            to="/admin/consultas"
            className="admin-feature admin-feature-link"
          >
            <CalendarDays size={25} />
            <h2>Consultas</h2>
            <p>Visualize os agendamentos e gerencie cancelamentos.</p>
            <span>Acessar consultas →</span>
          </Link>

          <Link
            to="/admin/disponibilidade"
            className="admin-feature admin-feature-link"
          >
            <Clock3 size={25} />
            <h2>Disponibilidade</h2>
            <p>Configure dias de atendimento, horários e bloqueios.</p>
            <span>Acessar disponibilidade →</span>
          </Link>

          <article className="admin-feature">
            <Settings size={25} />
            <h2>Configurações</h2>
            <p>Gerencie serviços e informações da conta.</p>
            <span>Em desenvolvimento</span>
          </article>
        </div>

        <Link to="/" className="admin-site-link">
          Voltar à página inicial
        </Link>
      </main>
    </div>
  );
}