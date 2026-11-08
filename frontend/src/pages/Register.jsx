
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">T</div>
        <h1>Create account</h1>
        <p>Join your TaskMatrix workspace.</p>

        {error && <div className="alert-error">{error}</div>}

        <label>Full name</label>
        <input required placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label>Email address</label>
        <input type="email" required placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <label>Password</label>
        <input type="password" minLength={6} required placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button className="primary-button" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
