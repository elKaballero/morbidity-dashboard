import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      login(username, password);
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Activity size={32} color="white" />
          </div>
          <h2 style={{color: 'var(--primary-blue)'}}>Exo Morb Central</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Acceso al Sistema de Morbilidad</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario / Sucursal</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. admin, sucursal_1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem', padding: '0.75rem'}}>
            Ingresar al Sistema
          </button>
        </form>
        
        <div style={styles.helpText}>
          <p>Usa "admin" para rol Maestro. Cualquier otro usuario asume rol Sucursal.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-color)',
    padding: '1rem'
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    backgroundColor: 'var(--primary-blue)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto',
    boxShadow: '0 4px 6px -1px rgba(10, 61, 107, 0.2)'
  },
  helpText: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem'
  }
};
