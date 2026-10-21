import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { api } from "../services/api.js";
import "../styles/admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      sessionStorage.setItem("adminToken", data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="admin-return">
          <ArrowLeft size={17} />
          Voltar ao site
        </Link>

        <div className="admin-login-heading">
          <span className="admin-eyebrow">ÁREA ADMINISTRATIVA</span>
          <h1>Acesse sua conta</h1>
          <p>
            Entre com suas credenciais para gerenciar
            os atendimentos do consultório.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-email">E-mail</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="Seu e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Senha</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar no painel"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="admin-login-footer">
          <LockKeyhole size={15} />
          Acesso exclusivo da administração
        </div>
      </div>
    </main>
  );
}