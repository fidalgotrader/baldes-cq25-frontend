import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro de ligação ao servidor');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌾</div>
          <h1>BALDES CQ25</h1>
          <p className="subtitle">Controlo de Qualidade — Campanha 2025</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Utilizador</label>
            <input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="nome.apelido" autoFocus required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 8 }} disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Credenciais de teste:</strong>
          <div>admin / admin123 &nbsp;·&nbsp; ana.silva / tecnico123</div>
          <div style={{ marginTop: 2 }}>leitura / leitura123</div>
        </div>
      </div>
    </div>
  );
}
