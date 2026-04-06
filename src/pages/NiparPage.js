import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { qaClass, badgeClass, formatNum, formatDate } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ObsModal from '../components/ObsModal';

const QA_OPTS = ['', 'OK', 'KO', 'NA'];

function QASelect({ value, onChange, disabled }) {
  return (
    <select className={`qa-select ${qaClass(value || null)}`} value={value || ''} onChange={e => onChange(e.target.value || null)} disabled={disabled}>
      {QA_OPTS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
    </select>
  );
}

export default function NiparPage() {
  const { canEdit, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [baldes, setBaldes] = useState([]);
  const [nifaps, setNifaps] = useState([]);
  const [obsModal, setObsModal] = useState(null); // { id, field, value, label }
  const [filters, setFilters] = useState({
    balde: searchParams.get('balde') || '',
    nifap: '', gsa_qa: '', ams_qa: '', recolhido: ''
  });

  const LIMIT = 50;

  useEffect(() => {
    axios.get('/api/nipar/meta/baldes').then(r => setBaldes(r.data));
  }, []);

  useEffect(() => {
    if (filters.balde) axios.get(`/api/nipar/meta/nifaps?balde=${filters.balde}`).then(r => setNifaps(r.data));
    else setNifaps([]);
  }, [filters.balde]);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT, ...filters };
    Object.keys(params).forEach(k => { if (!params[k] && params[k] !== false) delete params[k]; });
    axios.get('/api/nipar', { params }).then(r => {
      setRows(r.data.data); setTotal(r.data.total);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const updateField = async (id, field, value) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const { data } = await axios.put(`/api/nipar/${id}`, { [field]: value });
      setRows(rows => rows.map(r => r.id === id ? { ...r, ...data } : r));
    } catch (err) {
      alert('Erro ao guardar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const updateMultiple = async (id, updates) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const { data } = await axios.put(`/api/nipar/${id}`, updates);
      setRows(rows => rows.map(r => r.id === id ? { ...r, ...data } : r));
    } catch (err) {
      alert('Erro ao guardar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const filterChange = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const smo = (row) => {
    const qa = [row.gsa_qa, row.ams_qa, row.crits_ca_aval, row.crits_cc_aval, row.encab_aval];
    if (qa.includes('KO')) return 'KO';
    if (qa.every(q => q === 'OK' || q === 'NA')) return 'OK';
    return null;
  };

  return (
    <>
      {obsModal && (
        <ObsModal
          label={obsModal.label}
          value={obsModal.value}
          onClose={() => setObsModal(null)}
          onSave={async (val) => {
            await updateField(obsModal.id, obsModal.field, val);
            setObsModal(null);
          }}
          readOnly={!canEdit}
        />
      )}

      <div className="page-header">
        <div>
          <h2>Avaliação NIPAR</h2>
          <p>{total} registos{filters.balde ? ` · ${filters.balde}` : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Balde</span>
            <select className="form-control" style={{ minWidth: 130 }} value={filters.balde} onChange={e => filterChange('balde', e.target.value)}>
              <option value="">Todos</option>
              {baldes.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">NIFAP</span>
            <select className="form-control" style={{ minWidth: 150 }} value={filters.nifap} onChange={e => filterChange('nifap', e.target.value)}>
              <option value="">Todos</option>
              {nifaps.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">GSA_QA</span>
            <select className="form-control" value={filters.gsa_qa} onChange={e => filterChange('gsa_qa', e.target.value)}>
              <option value="">Todos</option>
              {['OK','KO','NA'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">AMS_QA</span>
            <select className="form-control" value={filters.ams_qa} onChange={e => filterChange('ams_qa', e.target.value)}>
              <option value="">Todos</option>
              {['OK','KO','NA'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">Recolhido</span>
            <select className="form-control" value={filters.recolhido} onChange={e => filterChange('recolhido', e.target.value)}>
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => { setFilters({ balde: '', nifap: '', gsa_qa: '', ams_qa: '', recolhido: '' }); setPage(1); }}>
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Registos NIPAR 2025</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {canEdit ? 'Clique nos semáforos para editar · 💬 para observações' : 'Modo leitura'}
          </span>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>NIFAP</th>
                  <th>Balde</th>
                  <th>Parc</th>
                  <th>CUL_ID</th>
                  <th>Cult.</th>
                  <th>Área Decl.</th>
                  <th>Recolhido</th>
                  <th>GSA_QA</th>
                  <th>AMS_QA</th>
                  <th>CCampo</th>
                  <th>Crit.CA</th>
                  <th>Crit.CC</th>
                  <th>Encab.</th>
                  <th>SMO</th>
                  <th>Técnico</th>
                  <th>Últ. Alt.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const isSaving = saving[row.id];
                  const autoSmo = smo(row);
                  return (
                    <tr key={row.id} style={{ opacity: isSaving ? 0.6 : 1 }}>
                      <td className="td-nowrap">{row.ranking}</td>
                      <td className="td-nowrap" style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.dte_nifap}</td>
                      <td><span style={{ fontWeight: 600, fontSize: 12 }}>{row.balde}</span></td>
                      <td>{row.parc_num}{row.sub_parc_num > 0 ? `.${row.sub_parc_num}` : ''}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{row.cul_id}</td>
                      <td>{row.cod_cult_decl1}</td>
                      <td>{formatNum(row.area_decl1)}</td>
                      <td>
                        {canEdit ? (
                          <input type="checkbox" checked={!!row.recolhido} onChange={e => updateField(row.id, 'recolhido', e.target.checked)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                        ) : (
                          <span className={`badge ${row.recolhido ? 'badge-recolhido' : 'badge-null'}`}>{row.recolhido ? 'Sim' : 'Não'}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {canEdit ? <QASelect value={row.gsa_qa} onChange={v => updateField(row.id, 'gsa_qa', v)} disabled={isSaving} /> : <span className={badgeClass(row.gsa_qa)}>{row.gsa_qa || '—'}</span>}
                          <button className={`obs-btn${row.obs_gsa ? ' has-obs' : ''}`} title="Observações GSA" onClick={() => setObsModal({ id: row.id, field: 'obs_gsa', value: row.obs_gsa, label: `GSA — NIFAP ${row.dte_nifap}` })}>💬</button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {canEdit ? <QASelect value={row.ams_qa} onChange={v => updateField(row.id, 'ams_qa', v)} disabled={isSaving} /> : <span className={badgeClass(row.ams_qa)}>{row.ams_qa || '—'}</span>}
                          <button className={`obs-btn${row.obs_ams ? ' has-obs' : ''}`} title="Observações AMS" onClick={() => setObsModal({ id: row.id, field: 'obs_ams', value: row.obs_ams, label: `AMS — NIFAP ${row.dte_nifap}` })}>💬</button>
                        </div>
                      </td>
                      <td>{canEdit ? <QASelect value={row.ccampo_aval} onChange={v => updateField(row.id, 'ccampo_aval', v)} disabled={isSaving} /> : <span className={badgeClass(row.ccampo_aval)}>{row.ccampo_aval || '—'}</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {canEdit ? <QASelect value={row.crits_ca_aval} onChange={v => updateField(row.id, 'crits_ca_aval', v)} disabled={isSaving} /> : <span className={badgeClass(row.crits_ca_aval)}>{row.crits_ca_aval || '—'}</span>}
                          <button className={`obs-btn${row.obs_crits_ca ? ' has-obs' : ''}`} onClick={() => setObsModal({ id: row.id, field: 'obs_crits_ca', value: row.obs_crits_ca, label: `Critérios CA — NIFAP ${row.dte_nifap}` })}>💬</button>
                        </div>
                      </td>
                      <td>{canEdit ? <QASelect value={row.crits_cc_aval} onChange={v => updateField(row.id, 'crits_cc_aval', v)} disabled={isSaving} /> : <span className={badgeClass(row.crits_cc_aval)}>{row.crits_cc_aval || '—'}</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {canEdit ? <QASelect value={row.encab_aval} onChange={v => updateField(row.id, 'encab_aval', v)} disabled={isSaving} /> : <span className={badgeClass(row.encab_aval)}>{row.encab_aval || '—'}</span>}
                          <button className={`obs-btn${row.obs_encab ? ' has-obs' : ''}`} onClick={() => setObsModal({ id: row.id, field: 'obs_encab', value: row.obs_encab, label: `Encabeçamento — NIFAP ${row.dte_nifap}` })}>💬</button>
                        </div>
                      </td>
                      <td>
                        {canEdit ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <QASelect value={row.smo_result} onChange={v => updateField(row.id, 'smo_result', v)} disabled={isSaving} />
                            {autoSmo && autoSmo !== row.smo_result && (
                              <button title={`Auto: ${autoSmo}`} className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => updateField(row.id, 'smo_result', autoSmo)}>↺{autoSmo}</button>
                            )}
                          </div>
                        ) : <span className={badgeClass(row.smo_result)}>{row.smo_result || '—'}</span>}
                      </td>
                      <td style={{ fontSize: 12 }}>{row.nome_tec_atrib || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(row.dat_alt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p = page <= 4 ? i + 1 : page - 3 + i;
              if (p > totalPages) return null;
              return <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            <span className="page-info">Página {page} de {totalPages} · {total} registos</span>
          </div>
        )}
      </div>
    </>
  );
}
