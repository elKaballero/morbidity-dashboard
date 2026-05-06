import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FilePlus, LogOut, History as HistoryIcon } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <h2>Exo Morb</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Morbilidad Ocupacional</p>
      </div>

      <nav style={styles.nav}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/history" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <HistoryIcon size={20} />
          <span>Historial Diaria</span>
        </NavLink>

        {user?.role === 'branch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink 
              to="/daily-entry" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <FilePlus size={20} />
              <span>Carga Diaria</span>
            </NavLink>

            <NavLink 
              to="/data-entry" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <FilePlus size={20} />
              <span>Ajuste Mensual</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.username}</div>
          <div style={styles.userRole}>{user?.role === 'master' ? 'Admin Central' : 'Usuario Sucursal'}</div>
        </div>
        <button className="btn btn-outline" style={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--surface-color)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0
  },
  logo: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--primary-blue)'
  },
  nav: {
    padding: '1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  navLinkActive: {
    backgroundColor: 'var(--light-blue)',
    color: 'var(--primary-blue)'
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid var(--border-color)'
  },
  userInfo: {
    marginBottom: '1rem'
  },
  userName: {
    fontWeight: 600,
    color: 'var(--text-main)'
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    alignItems: 'center'
  }
};
