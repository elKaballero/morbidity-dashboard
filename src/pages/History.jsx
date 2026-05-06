import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, Clock, User } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/daily-logs`);
        if (response.ok) {
          const data = await response.json();
          // Filter if not master
          if (user?.role === 'master') {
            setLogs(data);
          } else {
            setLogs(data.filter(log => log.branch_name === user?.branchName));
          }
        }
      } catch (err) {
        console.error('Error fetching logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando historial...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HistoryIcon size={24} /> Historial de Cargas Diarias
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          {user?.role === 'master' 
            ? 'Registro global de todas las actualizaciones diarias enviadas por las sucursales.'
            : 'Registro de todas las actualizaciones diarias enviadas por su sucursal.'}
        </p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay registros de carga diaria en el sistema.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Fecha de Carga</th>
                {user?.role === 'master' && <th style={{ padding: '1rem' }}>Sucursal</th>}
                <th style={{ padding: '1rem' }}>Mes Afectado</th>
                <th style={{ padding: '1rem' }}>Horas Sumadas</th>
                <th style={{ padding: '1rem' }}>Total Reposos (Nuevos)</th>
                <th style={{ padding: '1rem' }}>Notas Parciales</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const date = new Date(log.created_at).toLocaleString();
                const d = log.data_payload || {};
                const horas = d.workHours || 0;
                const reposos = (d.absences?.commonEvents || 0) + (d.absences?.occupationalEvents || 0);
                
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--text-muted)" /> {date}
                    </td>
                    {user?.role === 'master' && (
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} color="var(--primary-blue)" /> {log.branch_name}
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{log.month}</td>
                    <td style={{ padding: '1rem' }}>+{horas} h</td>
                    <td style={{ padding: '1rem' }}>
                      {reposos > 0 ? <span style={{ color: '#EF4444', fontWeight: 'bold' }}>+{reposos}</span> : '-'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.comments || 'Sin comentarios'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
