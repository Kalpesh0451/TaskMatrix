
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckSquare,
  FolderKanban,
  ListTodo,
  Users,
  Bell,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-auth-page">
      <section className="tm-auth-showcase">
        <div className="tm-auth-brand">
          <div className="tm-brand-mark tm-auth-mark">
            <CheckSquare size={31} strokeWidth={3} />
          </div>

          <span className="tm-auth-brand-name">
            Task<span>Matrix</span>
          </span>
        </div>

        <div className="tm-auth-showcase-content">
          <span className="tm-auth-eyebrow">PROJECT & TEAM MANAGEMENT</span>

          <h1>
            Bring your team's
            <br />
            work together.
          </h1>

          <p>
            Plan projects, organize tasks and collaborate with your team
            from one simple workspace.
          </p>

          <div className="tm-auth-features">
            <div>
              <FolderKanban size={20} />
              <span>Manage projects efficiently</span>
            </div>
            <div>
              <ListTodo size={20} />
              <span>Track every task and deadline</span>
            </div>
            <div>
              <Users size={20} />
              <span>Collaborate with your team</span>
            </div>
            <div>
              <Bell size={20} />
              <span>Stay updated with notifications</span>
            </div>
          </div>
        </div>

        <div className="tm-auth-showcase-footer">
          Simplify work. Stay organized. Achieve more.
        </div>
      </section>

      <section className="tm-auth-form-section">
        <form className="tm-auth-card" onSubmit={handleSubmit}>
          <div className="tm-auth-mobile-brand">
            <CheckSquare size={29} />
            <span>Task<span>Matrix</span></span>
          </div>

          <div className="tm-auth-heading-icon">
            <CheckSquare size={27} />
          </div>

          <h2>Welcome back!</h2>
          <p className="tm-auth-subtitle">
            Sign in to continue to your workspace.
          </p>

          {error && <div className="alert-error">{error}</div>}

          <label htmlFor="login-email">Email address</label>
          <div className="tm-input-wrapper">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <label htmlFor="login-password">Password</label>
          <div className="tm-input-wrapper">
            <Lock size={18} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              type="button"
              className="tm-password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            className="tm-auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="tm-auth-footer">
            Don't have an account? <Link to="/register">Create account</Link>
          </div>
        </form>

        <p className="tm-auth-copyright">
          © {new Date().getFullYear()} TaskMatrix. All rights reserved.
        </p>
      </section>
    </div>
  );
}
