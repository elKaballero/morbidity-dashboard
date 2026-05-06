import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';

export default function DailyEntry() {
  const { reports, addReport } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    workers: { monthly: 0, daily: 0, interns: 0, total: 0 },
    workDays: 1, // Usually you add 1 day of work daily
    workHours: 8, // Usually 8 hours
    preventive: {
      preEmployment: 0, postEmployment: 0, postVacation: 0, preVacation: 0,
      returnToWork: 0, control: 0, positionChange: 0, followUp: 0
    },
    curative: {
      orl: 0, osteo: 0, ophthalmology: 0, digestive: 0,
      psychological: 0, dermatological: 0, accidents: 0, others: 0
    },
    referrals: { ivss: 0, privateLab: 0, privateSpecialist: 0 },
    activities: { workshops: 0, csslMeetings: 0, bulletins: 0, brochures: 0 },
    absences: { commonEvents: 0, commonDays: 0, occupationalEvents: 0, occupationalDays: 0, totalEvents: 0, totalDays: 0 },
    demographics: { male: 0, female: 0, age18_30: 0, age31_45: 0, age46_plus: 0 },
    inventory: { analgesics: 0, antiallergics: 0, bandages: 0, syringes: 0, others: 0 },
    topDiagnoses: ['', '', '', '', ''],
    comments: ''
  });

  // Calculate current month's totals to show to the user
  const currentMonthReport = useMemo(() => {
    return reports.find(r => r.branch === user?.branchName && r.month === formData.month);
  }, [reports, user, formData.month]);

  const handleNestedChange = (category, field, value) => {
    let numValue = parseInt(value, 10) || 0;
    
    setFormData(prev => {
      const newState = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: numValue
        }
      };

      if (category === 'workers') {
        newState.workers.total = newState.workers.monthly + newState.workers.daily + newState.workers.interns;
      }
      if (category === 'absences') {
        newState.absences.totalEvents = newState.absences.commonEvents + newState.absences.occupationalEvents;
        newState.absences.totalDays = newState.absences.commonDays + newState.absences.occupationalDays;
      }
      return newState;
    });
  };

  const handleDiagnosisChange = (index, value) => {
    setFormData(prev => {
      const newDiags = [...prev.topDiagnoses];
      newDiags[index] = value;
      return { ...prev, topDiagnoses: newDiags };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sum logic
    const existing = currentMonthReport || {
      workDays: 0, workHours: 0,
      workers: { monthly: 0, daily: 0, interns: 0, total: 0 },
      preventive: {}, curative: {}, referrals: {}, activities: {}
    };

    const newComments = currentMonthReport?.comments 
      ? formData.comments ? `${currentMonthReport.comments} | ${formData.comments}` : currentMonthReport.comments
      : formData.comments;

    const aggregateCategory = (catName) => {
      const result = { ...(existing[catName] || {}) };
      Object.keys(formData[catName]).forEach(key => {
        result[key] = (parseInt(result[key], 10) || 0) + (parseInt(formData[catName][key], 10) || 0);
      });
      return result;
    };

    const existingDiags = Array.isArray(existing.topDiagnoses) ? existing.topDiagnoses : [];
    const newDiags = formData.topDiagnoses.filter(d => d.trim() !== '');
    const mergedDiags = [...new Set([...existingDiags.filter(d => d.trim() !== ''), ...newDiags])].slice(0, 5);
    while (mergedDiags.length < 5) mergedDiags.push('');

    const payload = {
      branch: user.branchName,
      month: formData.month,
      workDays: (parseInt(existing.workDays, 10) || 0) + (parseInt(formData.workDays, 10) || 0),
      workHours: (parseInt(existing.workHours, 10) || 0) + (parseInt(formData.workHours, 10) || 0),
      workers: aggregateCategory('workers'),
      preventive: aggregateCategory('preventive'),
      curative: aggregateCategory('curative'),
      referrals: aggregateCategory('referrals'),
      activities: aggregateCategory('activities'),
      absences: aggregateCategory('absences'),
      demographics: aggregateCategory('demographics'),
      inventory: aggregateCategory('inventory'),
      topDiagnoses: mergedDiags,
      comments: newComments
    };

    // Log the daily entry for history
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/daily-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch_name: user.branchName, month: formData.month, data_payload: formData })
    }).catch(console.error);

    addReport(payload);
    navigate('/');
  };

  const renderNumberInput = (category, field, label) => (
    <div className="form-group" key={field}>
      <label className="form-label">{label}</label>
      <input 
        type="number" 
        min="0"
        className="form-input" 
        value={formData[category][field]}
        onChange={(e) => handleNestedChange(category, field, e.target.value)}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Carga Diaria de Morbilidad</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Los valores que ingrese aquí se <strong>sumarán automáticamente</strong> a su reporte consolidado del mes de {formData.month}.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          <PlusCircle size={18} style={{marginRight: '0.5rem'}}/> Sumar Carga Diaria
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-green)' }}>
          <h3 className="card-title">Datos Generales</h3>
          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Mes y Año de Aplicación</label>
              <input type="month" name="month" className="form-input" value={formData.month} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Días Trabajados (Hoy)</label>
              <input type="number" name="workDays" className="form-input" value={formData.workDays} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Horas Laboradas (Hoy)</label>
              <input type="number" name="workHours" className="form-input" value={formData.workHours} onChange={handleChange} required />
            </div>
          </div>
          
          <h4 style={{marginTop: '1rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Trabajadores Vistos (Añadir al acumulado)</h4>
          <div className="grid-4">
            {renderNumberInput('workers', 'monthly', 'Nómina Mensual')}
            {renderNumberInput('workers', 'daily', 'Nómina Diaria')}
            {renderNumberInput('workers', 'interns', 'Pasantes')}
            <div className="form-group">
              <label className="form-label">Total a sumar</label>
              <input type="number" disabled className="form-input" value={formData.workers.total} style={{backgroundColor: 'var(--bg-color)', fontWeight: 'bold'}} />
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Casos Preventivos (Nuevos hoy)</h3>
            <div className="grid-2">
              {renderNumberInput('preventive', 'preEmployment', 'Pre-empleo')}
              {renderNumberInput('preventive', 'postEmployment', 'Post-empleo')}
              {renderNumberInput('preventive', 'preVacation', 'Pre-vacacional')}
              {renderNumberInput('preventive', 'postVacation', 'Post-vacacional')}
              {renderNumberInput('preventive', 'returnToWork', 'Reintegro')}
              {renderNumberInput('preventive', 'control', 'Control')}
              {renderNumberInput('preventive', 'positionChange', 'Cambio de Puesto')}
              {renderNumberInput('preventive', 'followUp', 'Seguimiento')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Consultas Curativas (Nuevas hoy)</h3>
            <div className="grid-2">
              {renderNumberInput('curative', 'orl', 'O.R.L.')}
              {renderNumberInput('curative', 'osteo', 'Osteomuscular')}
              {renderNumberInput('curative', 'ophthalmology', 'Oftalmológico')}
              {renderNumberInput('curative', 'digestive', 'Digestivo')}
              {renderNumberInput('curative', 'psychological', 'Psicológico')}
              {renderNumberInput('curative', 'dermatological', 'Dermatológico')}
              {renderNumberInput('curative', 'accidents', 'Accidentes de Trabajo')}
              {renderNumberInput('curative', 'others', 'Otros')}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Referidos (Hoy)</h3>
            <div className="grid-2">
              {renderNumberInput('referrals', 'ivss', 'IVSS')}
              {renderNumberInput('referrals', 'privateLab', 'Lab. Privado')}
              {renderNumberInput('referrals', 'privateSpecialist', 'Espec. Privado')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Actividades (Realizadas Hoy)</h3>
            <div className="grid-2">
              {renderNumberInput('activities', 'workshops', 'Talleres')}
              {renderNumberInput('activities', 'csslMeetings', 'Reuniones CSSL')}
              {renderNumberInput('activities', 'bulletins', 'Carteleras')}
              {renderNumberInput('activities', 'brochures', 'Folletos')}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Reposos Médicos (Nuevos)</h3>
            <div className="grid-2">
              {renderNumberInput('absences', 'commonEvents', 'Certificados (Común)')}
              {renderNumberInput('absences', 'commonDays', 'Días Perdidos (Común)')}
              {renderNumberInput('absences', 'occupationalEvents', 'Certificados (Ocupac.)')}
              {renderNumberInput('absences', 'occupationalDays', 'Días Perdidos (Ocupac.)')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Demografía de Casos Nuevos</h3>
            <div className="grid-2">
              {renderNumberInput('demographics', 'male', 'Masculino')}
              {renderNumberInput('demographics', 'female', 'Femenino')}
              {renderNumberInput('demographics', 'age18_30', '18 - 30 Años')}
              {renderNumberInput('demographics', 'age31_45', '31 - 45 Años')}
              {renderNumberInput('demographics', 'age46_plus', '46+ Años')}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Inventario Usado (Hoy)</h3>
            <div className="grid-2">
              {renderNumberInput('inventory', 'analgesics', 'Analgésicos')}
              {renderNumberInput('inventory', 'antiallergics', 'Antialérgicos')}
              {renderNumberInput('inventory', 'bandages', 'Vendajes')}
              {renderNumberInput('inventory', 'syringes', 'Inyectadoras')}
              {renderNumberInput('inventory', 'others', 'Otros')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Diagnósticos (Nuevos)</h3>
            <div className="grid-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div className="form-group" key={`diag-${i}`}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={`Añadir diagnóstico #${i + 1}`}
                    value={formData.topDiagnoses[i]}
                    onChange={(e) => handleDiagnosisChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Notas u Observaciones del Día</h3>
          <div className="form-group">
            <label className="form-label">Comentarios (Se añadirán al registro mensual)</label>
            <textarea 
              name="comments"
              className="form-input" 
              rows="2" 
              value={formData.comments}
              onChange={handleChange}
              placeholder="Opcional: Describa las novedades del día..."
            ></textarea>
          </div>
        </div>

      </form>
    </div>
  );
}
