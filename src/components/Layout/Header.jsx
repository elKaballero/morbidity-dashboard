import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  
  return (
    <header style={styles.header}>
      <div style={styles.branchInfo}>
        <h1 style={styles.title}>{user?.branchName}</h1>
      </div>
      <div style={styles.dateInfo}>
        {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '70px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    margin: 0
  },
  dateInfo: {
    color: 'var(--text-muted)',
    fontWeight: 500,
    textTransform: 'capitalize'
  }
};
