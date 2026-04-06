import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatNum, formatDate, downloadExcel } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RecolhidosPage() {
  const { canEdit } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBalde, setFilterBalde] = useState('');
  const [baldes, setBaldes] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    axios.get('/api/nipar/meta/baldes').then(r => setBaldes(r.data));
  }, []);

  const load = (balde = '') => {
    setLoading(true);
    axios.get('/api/nipar', { params: { recolhido: 'true', balde: balde || undefined, limit: 500 } })
      .then(r => setRows(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try { await downloadExcel('/api/export/recolhidos', 'Recolhidos_CQ25.xlsx'); }
    finally { setExporting(false); }
  };

  const toggleRecolhido = async (id, val) => {
    try {
      await axios.put(`/api/nipar/${id}`, { recolhido: val });
      setRows(rows => rows.filter(r => r.id !== id));
    } catch (err) { alert('Erro: ' + err.message); }
  };

  const byBalde = rows.reduce((acc, r) => {
    acc[r.balde] = (acc[r.balde] || 0) + 1; return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <div><h2>Recolhidos</h2><p>{rows.length} NIFAPs marcados como recolhidos</p></div>
        <button className="btn btn-accent" onClick={handleExport} disabled={exporting}>
          📥 {exporting ? 'A exportar...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Summary by balde */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {Object.entries(byBalde).map(([balde, count]) => (
          <div key={balde} className="stat-card accent">
            <div className="stat-label">{balde}</div>
            <div className="stat-value">{count}</div>
            <div className="stat-sub">recolhidos</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Lista de Recolhidos</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-control" style={{ width: 140 }} value={filterBalde} onChange={e => { setFilterBalde(e.target.value); load(e.target.value); }}>
              <option value="">Todos os baldes</option>
              {baldes.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Balde</th><th>NIFAP</th><th>Ranking</th><th>CUL_ID</th><th>Área Decl.</th><th>SMO</th><th>Técnico</th><th>Data Alt.</th>{canEdit && <th>Ação</th>}</tr>
              </thead>
              <tbody>
                {rows.filter(r => !filterBalde || r.balde === filterBalde).map(row => (
                  <tr key={row.id}>
                    <td><strong>{row.balde}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.dte_nifap}</td>
                    <td>{row.ranking}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{row.cul_id}</td>
                    <td>{formatNum(row.area_decl1)}</td>
                    <td>
                      {row.smo_result ? (
                        <span className={`badge badge-${row.smo_result.toLowerCase()}`}>{row.smo_result}</span>
                      ) : <span className="badge badge-null">—</span>}
                    </td>
                    <td style={{ fontSize: 12 }}>{row.nome_tec_atrib || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(row.dat_alt)}</td>
                    {canEdit && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => toggleRecolhido(row.id, false)} title="Desmarcar recolhido">
                          ✕ Desmarcar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <div className="loading-center" style={{ padding: 40 }}><span>Sem registos recolhidos</span></div>}
          </div>
        )}
      </div>
    </>
  );
}
