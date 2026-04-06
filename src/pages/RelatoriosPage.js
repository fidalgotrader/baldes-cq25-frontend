import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { downloadExcel } from '../utils/api';

export default function RelatoriosPage() {
  const [stats, setStats] = useState(null);
  const [baldes, setBaldes] = useState([]);
  const [filterBalde, setFilterBalde] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    axios.get('/api/nipar/meta/baldes').then(r => setBaldes(r.data));
    load('');
  }, []);

  const load = (balde) => {
    axios.get('/api/dashboard/stats', { params: balde ? { balde } : {} }).then(r => setStats(r.data));
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const params = filterBalde ? `?balde=${filterBalde}` : '';
      if (type === 'nipar') await downloadExcel(`/api/export/nipar${params}`, `NIPAR_CQ25${filterBalde ? '_' + filterBalde : ''}.xlsx`);
      if (type === 'recolhidos') await downloadExcel('/api/export/recolhidos', 'Recolhidos_CQ25.xlsx');
    } catch (err) { alert('Erro na exportação: ' + err.message); }
    finally { setExporting(''); }
  };

  const s = stats?.stats || {};

  const pct = (a, b) => {
    const total = parseInt(b) || 0;
    const val = parseInt(a) || 0;
    return total ? Math.round(val / total * 100) : 0;
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Relatórios & Exportação</h2><p>Análises e exportação de dados para Excel</p></div>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Filtrar por Balde</span>
            <select className="form-control" value={filterBalde} onChange={e => { setFilterBalde(e.target.value); load(e.target.value); }}>
              <option value="">Todos os baldes</option>
              {baldes.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>📥 Exportações Excel</h3></div>
        <div className="card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, padding: 20, border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <h4 style={{ marginBottom: 6 }}>NIPAR Completo</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Todos os registos NIPAR{filterBalde ? ` do ${filterBalde}` : ''} com semáforos coloridos, avaliações e observações.
            </p>
            <button className="btn btn-primary" onClick={() => handleExport('nipar')} disabled={!!exporting}>
              {exporting === 'nipar' ? '⏳ A exportar...' : '⬇ Exportar NIPAR.xlsx'}
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 240, padding: 20, border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <h4 style={{ marginBottom: 6 }}>Lista de Recolhidos</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Apenas os NIFAPs marcados como recolhidos, com resultado SMO.
            </p>
            <button className="btn btn-accent" onClick={() => handleExport('recolhidos')} disabled={!!exporting}>
              {exporting === 'recolhidos' ? '⏳ A exportar...' : '⬇ Exportar Recolhidos.xlsx'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="card">
          <div className="card-header"><h3>📈 Sumário Estatístico{filterBalde ? ` — ${filterBalde}` : ''}</h3></div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Total Registos</div><div className="stat-value">{s.total || 0}</div><div className="stat-sub">{s.num_nifaps} NIFAPs</div></div>
              <div className="stat-card accent"><div className="stat-label">Recolhidos</div><div className="stat-value">{s.recolhidos || 0}</div><div className="stat-sub">{pct(s.recolhidos, s.total)}% do total</div></div>
              <div className="stat-card ok"><div className="stat-label">GSA OK</div><div className="stat-value">{s.gsa_ok || 0}</div><div className="stat-sub">{pct(s.gsa_ok, s.total)}%</div></div>
              <div className="stat-card ko"><div className="stat-label">GSA KO</div><div className="stat-value" style={{ color: 'var(--ko-text)' }}>{s.gsa_ko || 0}</div><div className="stat-sub">{pct(s.gsa_ko, s.total)}%</div></div>
              <div className="stat-card ok"><div className="stat-label">AMS OK</div><div className="stat-value">{s.ams_ok || 0}</div><div className="stat-sub">{pct(s.ams_ok, s.total)}%</div></div>
              <div className="stat-card ok"><div className="stat-label">SMO OK</div><div className="stat-value">{s.smo_ok || 0}</div><div className="stat-sub">{pct(s.smo_ok, s.total)}%</div></div>
            </div>

            {/* Baldes breakdown */}
            {stats.baldes?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Detalhe por Balde</h4>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Balde</th><th>Total</th><th>Recolhidos</th><th>% Recolha</th><th>Conformes (SMO OK)</th><th>Não Conformes</th><th>Progresso</th></tr>
                    </thead>
                    <tbody>
                      {stats.baldes.map(b => {
                        const p = b.total ? Math.round(b.recolhidos / b.total * 100) : 0;
                        return (
                          <tr key={b.balde}>
                            <td><strong>{b.balde}</strong></td>
                            <td>{b.total}</td>
                            <td>{b.recolhidos}</td>
                            <td>{p}%</td>
                            <td><span className="badge badge-ok">{b.conformes}</span></td>
                            <td><span className="badge badge-ko">{b.nao_conformes}</span></td>
                            <td style={{ minWidth: 120 }}>
                              <div className="progress-bar">
                                <div className="progress-fill progress-ok" style={{ width: `${p}%` }}></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
