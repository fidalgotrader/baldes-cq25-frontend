import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PERFIS = ['admin', 'tecnico', 'leitura'];

export default function UtilizadoresPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ tecnico_nome: '', username: '', password: '', perfil: 'tecnico', ativo: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/utilizadores').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditUser(null); setForm({ tecnico_nome: '', username: '', password: '', perfil: 'tecnico', ativo: true }); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ tecnico_nome: u.tecnico_nome, username: u.username, password: '', perfil: u.perfil, ativo: u.ativo }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      if (editUser) { await axios.put(`/api/utilizadores/${editUser.id}`, form); setMsg('Utilizador atualizado.'); }
      else { await axios.post('/api/utilizadores', form); setMsg('Utilizador criado.'); }
      setShowModal(false); load();
    } catch (err) { setMsg('Erro: ' + (err.response?.data?.error || err.message)); }
    finally { setSaving(false); }
  };

  const PERFIL_BADGE = { admin: '#1B4F72', tecnico: '#117A65', leitura: '#E67E22' };

  return (
    <>
      <div className="page-header">
        <div><h2>Gestão de Utilizadores</h2><p>Criar e gerir contas de acesso</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Utilizador</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Erro') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="card">
        <div className="card-header"><h3>Utilizadores</h3><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length} utilizadores</span></div>
        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Username</th><th>Perfil</th><th>Estado</th><th>Criado em</th><th>Ações</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.tecnico_nome}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.username}</td>
                    <td><span className="badge" style={{ background: PERFIL_BADGE[u.perfil] + '22', color: PERFIL_BADGE[u.perfil] }}>{u.perfil}</span></td>
                    <td><span className={`badge ${u.ativo ? 'badge-ok' : 'badge-ko'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-PT') : '—'}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>✏️ Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editUser ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input className="form-control" value={form.tecnico_nome} onChange={e => setForm(f => ({ ...f, tecnico_nome: e.target.value }))} placeholder="Ex: João Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="joao.silva" disabled={!!editUser} />
              </div>
              <div className="form-group">
                <label className="form-label">Password {editUser ? '(deixar em branco para não alterar)' : ''}</label>
                <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil</label>
                <select className="form-control" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                  {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {editUser && (
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-control" value={form.ativo ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, ativo: e.target.value === 'true' }))}>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
