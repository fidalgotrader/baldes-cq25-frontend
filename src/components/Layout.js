import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ path }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', exact: true },
  { to: '/nipar', label: 'Avaliação NIPAR', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/encabecamento', label: 'Encabeçamento', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { to: '/recolhidos', label: 'Recolhidos', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0' },
  { to: '/relatorios', label: 'Relatórios / Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const ADMIN_NAV = [
  { to: '/utilizadores', label: 'Utilizadores', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';

  return (
    <div className="app-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h2>🌾 BALDES CQ25</h2>
          <span>Controlo de Qualidade 2025</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Principal</div>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.exact} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Icon path={n.icon} /> {n.label}
            </NavLink>
          ))}
          {isAdmin && <>
            <div className="nav-section">Administração</div>
            {ADMIN_NAV.map(n => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon path={n.icon} /> {n.label}
              </NavLink>
            ))}
          </>}
        </nav>
        <div className="sidebar-footer">
          <strong>{user?.nome}</strong>
          {user?.perfil} · <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', padding: 0, textDecoration: 'underline' }}>Sair</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="topbar-title">Campanha 2025</span>
          <div className="topbar-user">
            <div className="avatar">{initials}</div>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{user?.nome}</span>
              <span style={{ fontSize: 11, textTransform: 'capitalize' }}>{user?.perfil}</span>
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
