import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDate } from '../utils/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/><span>A carregar...</span></div>;

  const s = data?.stats || {};
  const total = parseInt(s.total) || 0;
  const recolhidos = parseInt(s.recolhidos) || 0;
  const pctRecolhidos = total ? Math.round(recolhidos / total * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Resumo geral da campanha CQ25 — {formatDate(new Date())}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/nipar')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Abrir Avaliação NIPAR
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Registos</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">{s.num_nifaps} NIFAPs · {s.num_baldes} Baldes</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Recolhidos</div>
          <div className="stat-value">{recolhidos}</div>
          <div className="stat-sub">{pctRecolhidos}% do total</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">GSA Conformes</div>
          <div className="stat-value">{s.gsa_ok || 0}</div>
          <div className="stat-sub" style={{ color: 'var(--ko-text)' }}>{s.gsa_ko || 0} não conformes</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">AMS Conformes</div>
          <div className="stat-value">{s.ams_ok || 0}</div>
          <div className="stat-sub" style={{ color: 'var(--text-muted)' }}>AMS OK</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">SMO Conformes</div>
          <div className="stat-value">{s.smo_ok || 0}</div>
          <div className="stat-sub" style={{ color: 'var(--ko-text)' }}>{s.smo_ko || 0} KO</div>
        </div>
        <div className="stat-card" style={{ '--primary': '#E67E22' }}>
          <div className="stat-label">Pendentes GSA</div>
          <div className="stat-value" style={{ color: '#E67E22' }}>{s.gsa_pendente || 0}</div>
          <div className="stat-sub">sem avaliação GSA</div>
        </div>
      </div>

      {/* Progress recolhidos */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Progresso de Recolha</h3><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{recolhidos} / {total}</span></div>
        <div className="card-body">
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill progress-ok" style={{ width: `${pctRecolhidos}%` }}></div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{pctRecolhidos}% concluído</div>
        </div>
      </div>

      {/* Baldes table */}
      <div className="card">
        <div className="card-header">
          <h3>Resumo por Balde</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/nipar')}>Ver todos →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Balde</th>
                <th>Total</th>
                <th>Recolhidos</th>
                <th>% Recolha</th>
                <th>Conformes</th>
                <th>Não Conformes</th>
                <th>Progresso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.baldes || []).map(b => {
                const pct = b.total ? Math.round(b.recolhidos / b.total * 100) : 0;
                return (
                  <tr key={b.balde}>
                    <td><strong>{b.balde}</strong></td>
                    <td>{b.total}</td>
                    <td>{b.recolhidos}</td>
                    <td>{pct}%</td>
                    <td><span className="badge badge-ok">{b.conformes}</span></td>
                    <td><span className="badge badge-ko">{b.nao_conformes}</span></td>
                    <td style={{ minWidth: 100 }}>
                      <div className="progress-bar">
                        <div className="progress-fill progress-ok" style={{ width: `${pct}%` }}></div>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/nipar?balde=${b.balde}`)}>Ver →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
