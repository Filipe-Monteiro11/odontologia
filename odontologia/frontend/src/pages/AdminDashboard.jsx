import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  LogOut,
  Settings,
} from "lucide-react";
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

    api("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setAdmin(data.admin))
      .catch((err) => {
        sessionStorage.removeItem("adminToken");
        setError(err.message);
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  }

  if (!admin) {
    return (
      <div className="admin-loading" role="status">
        {error || "Verificando acesso..."}
      </div>
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
          <article className="admin-feature">
            <CalendarDays size={25} />
            <h2>Consultas</h2>
            <p>
              Visualize e gerencie os agendamentos dos pacientes.
            </p>
            <span>Em desenvolvimento</span>
          </article>

          <article className="admin-feature">
            <Clock3 size={25} />
            <h2>Disponibilidade</h2>
            <p>
              Configure dias de atendimento, horários e bloqueios.
            </p>
            <span>Próxima etapa</span>
          </article>

          <article className="admin-feature">
            <Settings size={25} />
            <h2>Configurações</h2>
            <p>
              Gerencie serviços e informações da conta.
            </p>
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