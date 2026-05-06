import { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Activity, FileText, HeartPulse, Download, AlertTriangle, Stethoscope } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLORS = ['#0A3D6B', '#1C5D99', '#008148', '#03A35C', '#F59E0B', '#64748B', '#0F172A', '#E8F1F8'];
const ALERT_THRESHOLD = 1.5; // 50% increase month-over-month triggers alert

export default function Dashboard() {
  const { reports } = useData();
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const dashboardRef = useRef(null);

  const allBranches = useMemo(() => {
    const branches = new Set(reports.map(r => r.branch));
    return Array.from(branches);
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (user?.role !== 'master') {
      return reports.filter(r => r.branch === user?.branchName);
    }
    if (selectedBranch === 'Todas') {
      return reports;
    }
    return reports.filter(r => r.branch === selectedBranch);
  }, [reports, user, selectedBranch]);

  const getConsolidatedReport = (monthReports, targetMonth) => {
    const consolidated = {
      month: targetMonth,
      branch: 'Consolidado Todas las Sucursales',
      workDays: Math.max(...monthReports.map(r => parseInt(r.workDays, 10) || 0)),
      workers: { total: 0 },
      preventive: {}, curative: {}, absences: {}, demographics: {}, inventory: {}, topDiagnoses: []
    };

    let allDiags = [];

    monthReports.forEach(r => {
      consolidated.workers.total += (parseInt(r.workers?.total, 10) || 0);
      Object.entries(r.preventive || {}).forEach(([k, v]) => consolidated.preventive[k] = (consolidated.preventive[k] || 0) + (parseInt(v, 10) || 0));
      Object.entries(r.curative || {}).forEach(([k, v]) => consolidated.curative[k] = (consolidated.curative[k] || 0) + (parseInt(v, 10) || 0));
      Object.entries(r.absences || {}).forEach(([k, v]) => consolidated.absences[k] = (consolidated.absences[k] || 0) + (parseInt(v, 10) || 0));
      Object.entries(r.demographics || {}).forEach(([k, v]) => consolidated.demographics[k] = (consolidated.demographics[k] || 0) + (parseInt(v, 10) || 0));
      Object.entries(r.inventory || {}).forEach(([k, v]) => consolidated.inventory[k] = (consolidated.inventory[k] || 0) + (parseInt(v, 10) || 0));
      
      if (Array.isArray(r.topDiagnoses)) {
        allDiags = [...allDiags, ...r.topDiagnoses.filter(d => !!String(d).trim())];
      }
    });

    // Make top diagnoses unique for consolidation and pick top 5
    consolidated.topDiagnoses = [...new Set(allDiags)].slice(0, 5);
    while (consolidated.topDiagnoses.length < 5) consolidated.topDiagnoses.push('');
    return consolidated;
  };

  const sortedReportsArray = useMemo(() => {
    if (user?.role === 'master' && selectedBranch === 'Todas') {
      const months = [...new Set(filteredReports.map(r => r.month))].sort();
      return months.map(m => {
        return getConsolidatedReport(filteredReports.filter(r => r.month === m), m);
      });
    }
    return [...filteredReports].sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredReports, user, selectedBranch]);

  const latestReport = sortedReportsArray[sortedReportsArray.length - 1];
  const previousReport = sortedReportsArray.length > 1 ? sortedReportsArray[sortedReportsArray.length - 2] : null;

  if (!latestReport || filteredReports.length === 0) {
    return (
      <div>
        <h2 className="card-title">Dashboard</h2>
        <div className="card">No hay datos disponibles para mostrar.</div>
      </div>
    );
  }

  // Generate Alerts based on month-over-month curative cases
  const alerts = [];
  if (previousReport && latestReport) {
    Object.entries(latestReport.curative || {}).forEach(([sys, cases]) => {
      const prevCases = parseInt(previousReport.curative?.[sys], 10) || 0;
      const currCases = parseInt(cases, 10) || 0;
      if (prevCases > 0 && currCases >= prevCases * ALERT_THRESHOLD) {
        alerts.push(`Alerta: Incremento inusual en morbilidad ${sys.toUpperCase()} (${currCases} casos vs ${prevCases} el mes anterior).`);
      }
    });
  }

  // Export PDF Logic
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 1.5 });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`Reporte Epidemiológico - ${latestReport.month}`, 10, 10);
      pdf.addImage(imgData, 'JPEG', 0, 15, pdfWidth, pdfHeight);
      pdf.save(`ExoMorb_Reporte_${latestReport.month}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Error al exportar a PDF.");
    }
  };

  // Charts Data Prep
  const preventiveData = Object.entries(latestReport.preventive || {}).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), Casos: value
  })).filter(d => d.name.toLowerCase() !== 'total' && d.Casos > 0);

  const curativeData = Object.entries(latestReport.curative || {}).map(([key, value]) => ({
    name: key.toUpperCase(), value: value
  })).filter(item => item.name !== 'TOTAL' && item.value > 0);

  const demoSexData = [
    { name: 'Masculino', value: parseInt(latestReport.demographics?.male || 0, 10) },
    { name: 'Femenino', value: parseInt(latestReport.demographics?.female || 0, 10) }
  ].filter(d => d.value > 0);

  const absDays = parseInt(latestReport.absences?.totalDays || 0, 10);
  const trendData = sortedReportsArray.map(r => ({
    name: r.month, Trabajadores: parseInt(r.workers?.total || 0, 10)
  }));

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
      <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: color, display: 'flex' }}><Icon size={24} color="white" /></div>
      <div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 600 }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Dashboard de Morbilidad</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Mostrando datos para: <strong>{user?.role === 'master' ? (selectedBranch === 'Todas' ? 'Consolidado Global' : selectedBranch) : user?.branchName}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.role === 'master' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select 
                value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              >
                <option value="Todas">Todas las sucursales (Consolidado)</option>
                {allBranches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
              </select>
            </div>
          )}
          <button className="btn btn-outline" onClick={handleExportPDF} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Alertas Epidemiológicas */}
      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          <h4 style={{ color: '#B91C1C', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Alertas Epidemiológicas Detectadas
          </h4>
          <ul style={{ margin: 0, color: '#991B1B', paddingLeft: '1.5rem' }}>
            {alerts.map((al, idx) => <li key={idx} style={{marginBottom: '0.25rem'}}>{al}</li>)}
          </ul>
        </div>
      )}

      {/* Snapshot Area for PDF */}
      <div ref={dashboardRef} style={{ backgroundColor: 'var(--bg-color)', padding: '1px' }}>
        <div className="grid-5" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <StatsCard title="Total Trabajadores" value={latestReport.workers?.total || 0} icon={Users} color="var(--primary-blue)" />
          <StatsCard title="Días Pérdidos (Reposos)" value={absDays} icon={Stethoscope} color="#EF4444" />
          <StatsCard title="Exámenes Preventivos" value={Object.entries(latestReport.preventive||{}).filter(([k])=>k!=='total').reduce((sum, [k,v])=>sum+parseInt(v||0),0)} icon={HeartPulse} color="var(--primary-green)" />
          <StatsCard title="Consultas Curativas" value={Object.entries(latestReport.curative||{}).filter(([k])=>k!=='total').reduce((sum, [k,v])=>sum+parseInt(v||0),0)} icon={Activity} color="var(--warning-color)" />
          <StatsCard title="Días Hábiles" value={latestReport.workDays || 0} icon={FileText} color="var(--secondary-blue)" />
        </div>

        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3 className="card-title">Distribución Curativa</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={curativeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {curativeData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Demografía (Sexo)</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demoSexData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {demoSexData.map((e, i) => <Cell key={i} fill={i === 0 ? '#1C5D99' : '#D81159'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Desglose Preventivo</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preventiveData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="Casos" fill="var(--primary-green)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Top 5 Diagnósticos Específicos</h3>
            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', marginTop: '1rem' }}>
              {(() => {
                let diags = latestReport.topDiagnoses || [];
                if (typeof diags === 'string') {
                  try { diags = JSON.parse(diags); } catch(e) { diags = []; }
                }
                const validDiags = Array.isArray(diags) ? diags.filter(d => !!String(d).trim()) : [];
                
                if (validDiags.length > 0) {
                  return validDiags.map((diag, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{diag}</li>
                  ));
                } else {
                  return <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-1.5rem' }}>No hay diagnósticos específicos registrados.</li>;
                }
              })()}
            </ol>
          </div>

          <div className="card">
            <h3 className="card-title">Tendencia de Trabajadores Vistos (Histórico)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Trabajadores" stroke="var(--primary-blue)" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
