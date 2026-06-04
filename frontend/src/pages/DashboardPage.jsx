import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Title, Tooltip, Legend
} from 'chart.js';
import Sidebar from '../components/layout/Sidebar';
import api from '../api/axios';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Title, Tooltip, Legend
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data));
  }, []);

  if (!stats) return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.loading}>Cargando estadísticas...</div>
      </main>
    </div>
  );

  const cards = [
    { label: 'Total Incidentes', value: stats.totalIncidentes,
      icon: '📋', color: '#1565c0' },
    { label: 'Robos',            value: stats.totalRobos,
      icon: '🚨', color: '#b71c1c' },
    { label: 'Hurtos',           value: stats.totalHurtos,
      icon: '⚠️',  color: '#e65100' },
    { label: 'Recuperaciones',   value: stats.totalRecuperaciones,
      icon: '✅', color: '#1b5e20' },
    { label: 'Casos Abiertos',   value: stats.incidentesAbiertos,
      icon: '🔓', color: '#4a148c' },
    { label: 'Este Mes',         value: stats.incidentesEsteMes,
      icon: '📅', color: '#006064' },
    { label: 'Vehículos Robados',value: stats.vehiculosRobados,
      icon: '🚗', color: '#880e4f' },
    { label: 'Recuperados',      value: stats.vehiculosRecuperados,
      icon: '🔑', color: '#33691e' },
  ];

  const donutData = {
    labels: ['Robos', 'Hurtos', 'Recuperaciones'],
    datasets: [{
      data: [stats.totalRobos, stats.totalHurtos, stats.totalRecuperaciones],
      backgroundColor: ['#ef5350', '#ff9800', '#66bb6a'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: ['Abiertos', 'En Investigación', 'Cerrados'],
    datasets: [{
      label: 'Incidentes por estado',
      data: [
        stats.incidentesAbiertos,
        stats.incidentesEnInvestigacion,
        stats.incidentesCerrados
      ],
      backgroundColor: ['#42a5f5', '#ffa726', '#66bb6a'],
      borderRadius: 8
    }]
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>Dashboard Estadístico</h1>
        <p style={styles.subtitle}>
          Resumen operativo de la unidad policial
        </p>

        {/* Tarjetas */}
        <div style={styles.grid}>
          {cards.map(card => (
            <div key={card.label} style={styles.card}>
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={{
                ...styles.cardValue, color: card.color
              }}>
                {card.value}
              </div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Gráficas */}
        <div style={styles.charts}>
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>Estado de Incidentes</h3>
            <Bar data={barData} options={{ responsive: true,
              plugins: { legend: { display: false } }
            }} />
          </div>
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>Tipos de Delito</h3>
            <Doughnut data={donutData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', fontFamily: 'system-ui, sans-serif' },
  main: {
    marginLeft: '240px', flex: 1,
    padding: '32px',
    minHeight: '100vh',
    background: '#f5f7fa'
  },
  loading: { textAlign: 'center', padding: '60px', color: '#666' },
  title: { fontSize: '28px', fontWeight: '800',
    color: '#0d1b2a', margin: '0 0 8px 0' },
  subtitle: { color: '#666', marginBottom: '32px', margin: '0 0 32px 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  cardIcon: { fontSize: '28px', marginBottom: '8px' },
  cardValue: { fontSize: '36px', fontWeight: '800', lineHeight: 1 },
  cardLabel: { fontSize: '12px', color: '#666',
    marginTop: '6px', fontWeight: '500' },
  charts: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  chartBox: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  chartTitle: { fontSize: '16px', fontWeight: '700',
    color: '#333', margin: '0 0 16px 0' }
};