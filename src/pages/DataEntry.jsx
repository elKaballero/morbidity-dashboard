import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

export default function DataEntry() {
  const { addReport } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    workers: {
      monthly: 0, daily: 0, interns: 0, total: 0
    },
    workDays: 0,
    workHours: 0,
    preventive: {
      preEmployment: 0, postEmployment: 0, postVacation: 0, preVacation: 0,
      returnToWork: 0, control: 0, positionChange: 0, followUp: 0
    },
    curative: {
      orl: 0, osteo: 0, ophthalmology: 0, digestive: 0,
      psychological: 0, dermatological: 0, accidents: 0, others: 0
    },
    referrals: {
      ivss: 0, privateLab: 0, privateSpecialist: 0
    },
    activities: {
      workshops: 0, csslMeetings: 0, bulletins: 0, brochures: 0
    },
    absences: {
      commonEvents: 0, commonDays: 0, occupationalEvents: 0, occupationalDays: 0, totalEvents: 0, totalDays: 0
    },
    demographics: {
      male: 0, female: 0, age18_30: 0, age31_45: 0, age46_plus: 0
    },
    inventory: {
      analgesics: 0, antiallergics: 0, bandages: 0, syringes: 0, others: 0
    },
    topDiagnoses: ['', '', '', '', ''],
    comments: ''
  });

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

      // Auto calculate total workers
      if (category === 'workers') {
        newState.workers.total = newState.workers.monthly + newState.workers.daily + newState.workers.interns;
      }
      
      // Auto calculate totals for absences
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
    const payload = {
      ...formData,
      branch: user.branchName
    };
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
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Cargar Reporte Mensual</h2>
          <p style={{ color: 'var(--text-muted)' }}>Complete los datos epidemiológicos de la sucursal.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          <Save size={18} style={{marginRight: '0.5rem'}}/> Guardar Reporte
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-title">Datos Generales</h3>
          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Mes y Año</label>
              <input type="month" name="month" className="form-input" value={formData.month} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Días Hábiles</label>
              <input type="number" name="workDays" className="form-input" value={formData.workDays} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Horas Laboradas</label>
              <input type="number" name="workHours" className="form-input" value={formData.workHours} onChange={handleChange} required />
            </div>
          </div>
          
          <h4 style={{marginTop: '1rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Trabajadores Vistos</h4>
          <div className="grid-4">
            {renderNumberInput('workers', 'monthly', 'Nómina Mensual')}
            {renderNumberInput('workers', 'daily', 'Nómina Diaria')}
            {renderNumberInput('workers', 'interns', 'Pasantes')}
            <div className="form-group">
              <label className="form-label">Total</label>
              <input type="number" disabled className="form-input" value={formData.workers.total} style={{backgroundColor: 'var(--bg-color)', fontWeight: 'bold'}} />
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Exámenes Preventivos</h3>
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
            <h3 className="card-title">Consultas Curativas</h3>
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
            <h3 className="card-title">Gestión de Referencias</h3>
            <div className="grid-2">
              {renderNumberInput('referrals', 'ivss', 'IVSS')}
              {renderNumberInput('referrals', 'privateLab', 'Laboratorio Privado')}
              {renderNumberInput('referrals', 'privateSpecialist', 'Especialista Privado')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Actividades Complementarias</h3>
            <div className="grid-2">
              {renderNumberInput('activities', 'workshops', 'Talleres')}
              {renderNumberInput('activities', 'csslMeetings', 'Reuniones CSSL')}
              {renderNumberInput('activities', 'bulletins', 'Carteleras')}
              {renderNumberInput('activities', 'brochures', 'Folletos')}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Análisis Cualitativo</h3>
          <div className="form-group">
            <label className="form-label">Discusión / Comentarios del Médico</label>
            <textarea 
              name="comments"
              className="form-input" 
              rows="4" 
              value={formData.comments}
              onChange={handleChange}
              placeholder="Describa tendencias, hallazgos relevantes o recomendaciones del mes..."
            ></textarea>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Reposos Médicos (Ausentismo)</h3>
            <div className="grid-2">
              {renderNumberInput('absences', 'commonEvents', 'Certificados (Común)')}
              {renderNumberInput('absences', 'commonDays', 'Días Perdidos (Común)')}
              {renderNumberInput('absences', 'occupationalEvents', 'Certificados (Ocupacional)')}
              {renderNumberInput('absences', 'occupationalDays', 'Días Perdidos (Ocupacional)')}
              <div className="form-group">
                <label className="form-label">Total Certificados</label>
                <input type="number" disabled className="form-input" value={formData.absences.totalEvents} style={{backgroundColor: 'var(--bg-color)', fontWeight: 'bold'}} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Días Perdidos</label>
                <input type="number" disabled className="form-input" value={formData.absences.totalDays} style={{backgroundColor: 'var(--bg-color)', fontWeight: 'bold'}} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Demografía de Pacientes</h3>
            <div className="grid-2">
              {renderNumberInput('demographics', 'male', 'Masculino')}
              {renderNumberInput('demographics', 'female', 'Femenino')}
              {renderNumberInput('demographics', 'age18_30', 'Edad: 18 - 30')}
              {renderNumberInput('demographics', 'age31_45', 'Edad: 31 - 45')}
              {renderNumberInput('demographics', 'age46_plus', 'Edad: 46+')}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Uso de Inventario (Básico)</h3>
            <div className="grid-2">
              {renderNumberInput('inventory', 'analgesics', 'Analgésicos')}
              {renderNumberInput('inventory', 'antiallergics', 'Antialérgicos')}
              {renderNumberInput('inventory', 'bandages', 'Vendajes')}
              {renderNumberInput('inventory', 'syringes', 'Inyectadoras')}
              {renderNumberInput('inventory', 'others', 'Otros')}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Top 5 Diagnósticos Específicos</h3>
            <div className="grid-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div className="form-group" key={`diag-${i}`}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={`Diagnóstico #${i + 1}`}
                    value={formData.topDiagnoses[i]}
                    onChange={(e) => handleDiagnosisChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
