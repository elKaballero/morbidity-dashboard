import { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function DataProvider({ children }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/reports`);
        if (response.ok) {
          const data = await response.json();
          setReports(data);
          localStorage.setItem('morbidity_reports', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Fetch reports failed", err);
        const stored = localStorage.getItem('morbidity_reports');
        if (stored) {
          setReports(JSON.parse(stored));
        } else {
          setReports([]);
        }
      }
    };
    fetchReports();
  }, []);

  const addReport = async (report) => {
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      if (response.ok) {
        const newReports = [...reports, { ...report, id: Date.now().toString() }];
        setReports(newReports);
        localStorage.setItem('morbidity_reports', JSON.stringify(newReports));
      }
    } catch (err) {
      console.error("Save report failed", err);
      const newReports = [...reports, { ...report, id: Date.now().toString() }];
      setReports(newReports);
      localStorage.setItem('morbidity_reports', JSON.stringify(newReports));
    }
  };

  return (
    <DataContext.Provider value={{ reports, addReport }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
