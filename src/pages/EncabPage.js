import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatNum, formatDate } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EncabPage() {
  const { canEdit } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterBalde, setFilterBalde] = useState('');
  const [baldes, setBaldes] = useState([]);

  useEffect(() => {
    axios.get('/api/nipar/meta/baldes').then(r => setBaldes(r.data));
    load();
  }, []);

  const load = (balde = '') => {
    setLoading(true);
    axios.get('/api/encab', { params: balde ? { balde } : {} })
      .then(r => setRows(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  const handleFilter = (v) => { setFilterBalde(v); load(v); };

  const startEdit = (row) => { setEditing(row.id); setEditForm({ interv: row.interv || '', total_cn: row.total_cn || '', total_sa: row.total_sa || '', total_sf: row.total_sf || '' }); };
  const cancelEdit = () => { setEditing(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/encab/${id}`, editForm);
      setRows(rows => rows.map(r => r.id === id ? { ...r, ...data } : r));
      setEditing(null);
    } catch (err) { alert('Erro: ' + err.response?.data?.error); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Encabeçamento</h2><p>Dados de encabeçamento por NIFAP — 2025</p></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Balde</span>
            <select className="form-control" value={filterBalde} onChange={e => handleFilter(e.target.value)}>
              <option value="">Todos</option>
              {baldes.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Encabeçamento CAD 2025</h3><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rows.length} registos</span></div>
        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NIFAP</th><th>Balde</th><th>Intervenção</th><th>Total CN</th>
                  <th>Total SA</th><th>Total SF</th><th>Últ. Alt.</th><th>Técnico</th>
                  {canEdit && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.dte_nifap}</td>
                    <td><strong>{row.balde}</strong></td>
                    {editing === row.id ? (
                      <>
                        <td><input className="form-control" style={{ width: 120 }} value={editForm.interv} onChange={e => setEditForm(f => ({ ...f, interv: e.target.value }))}/></td>
                        <td><input className="form-control" style={{ width: 90 }} type="number" step="0.01" value={editForm.total_cn} onChange={e => setEditForm(f => ({ ...f, total_cn: e.target.value }))}/></td>
                        <td><input className="form-control" style={{ width: 90 }} type="number" step="0.01" value={editForm.total_sa} onChange={e => setEditForm(f => ({ ...f, total_sa: e.target.value }))}/></td>
                        <td><input className="form-control" style={{ width: 90 }} type="number" step="0.01" value={editForm.total_sf} onChange={e => setEditForm(f => ({ ...f, total_sf: e.target.value }))}/></td>
                        <td colSpan={2}></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn-accent btn-sm" onClick={() => saveEdit(row.id)} disabled={saving}>💾 Guardar</button>
                          <button className="btn btn-ghost btn-sm" onClick={cancelEdit} style={{ marginLeft: 6 }}>Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{row.interv || '—'}</td>
                        <td>{formatNum(row.total_cn)}</td>
                        <td>{formatNum(row.total_sa)}</td>
                        <td>{formatNum(row.total_sf)}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(row.dat_alt)}</td>
                        <td style={{ fontSize: 12 }}>{row.nome_uti_alt || '—'}</td>
                        {canEdit && <td><button className="btn btn-outline btn-sm" onClick={() => startEdit(row)}>✏️ Editar</button></td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
