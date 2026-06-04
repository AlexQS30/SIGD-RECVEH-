import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import Sidebar from '../components/layout/Sidebar';
import api from '../api/axios';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>
        <div style={s.loadingBox}>
          <div style={s.loadingSpinner}>📊</div>
          <div>Cargando estadísticas...</div>
        </div>
      </main>
    </div>
  );

  if (!stats) return null;

  // ── Tarjetas ─────────────────────────────────────────────────
  const cards = [
    { label:'Total Incidentes',  value: stats.totalIncidentes,        icon:'📋', color:'#1565c0' },
    { label:'Robos',             value: stats.totalRobos,             icon:'🚨', color:'#b71c1c' },
    { label:'Hurtos',            value: stats.totalHurtos,            icon:'⚠️', color:'#e65100' },
    { label:'Recuperaciones',    value: stats.totalRecuperaciones,    icon:'✅', color:'#1b5e20' },
    { label:'Casos Abiertos',    value: stats.incidentesAbiertos,     icon:'🔓', color:'#4a148c' },
    { label:'Este Mes',          value: stats.incidentesEsteMes,      icon:'📅', color:'#006064' },
    { label:'Vehículos Robados', value: stats.vehiculosRobados,       icon:'🚗', color:'#880e4f' },
    { label:'Recuperados',       value: stats.vehiculosRecuperados,   icon:'🔑', color:'#33691e' },
  ];

  // ── Gráfica 1: Donut tipos de delito ─────────────────────────
  const donutData = {
    labels: ['Robos', 'Hurtos', 'Recuperaciones'],
    datasets: [{
      data: [
        stats.totalRobos,
        stats.totalHurtos,
        stats.totalRecuperaciones
      ],
      backgroundColor: ['#ef5350','#ff9800','#66bb6a'],
      borderWidth: 0
    }]
  };

  // ── Gráfica 2: Barras estado de incidentes ───────────────────
  const barEstadoData = {
    labels: ['Abiertos', 'En Investigación', 'Cerrados'],
    datasets: [{
      label: 'Incidentes',
      data: [
        stats.incidentesAbiertos,
        stats.incidentesEnInvestigacion,
        stats.incidentesCerrados
      ],
      backgroundColor: ['#ef5350','#ff9800','#66bb6a'],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // ── Gráfica 3: Línea tendencia mensual ───────────────────────
  const tendencia = stats.tendenciaMensual || [];
  const lineData = {
    labels: tendencia.map(t => t.mes),
    datasets: [{
      label: 'Incidentes',
      data: tendencia.map(t => t.total),
      borderColor: '#1565c0',
      backgroundColor: 'rgba(21,101,192,0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#1565c0',
      pointRadius: 4,
      tension: 0.3,
      fill: true
    }]
  };

  // ── Gráfica 4: Barras por día de semana ──────────────────────
  const diasSemana = stats.porDiaSemana || [];
  const barDiaData = {
    labels: diasSemana.map(d => d.dia),
    datasets: [{
      label: 'Incidentes',
      data: diasSemana.map(d => d.total),
      backgroundColor: diasSemana.map((_, i) =>
        i === 5 || i === 0
          ? '#ef5350'   // Sáb y Dom más destacados
          : '#42a5f5'
      ),
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  // ── Tasa de recuperación ─────────────────────────────────────
  const tasa = stats.tasaRecuperacion || 0;
  const tasaColor = tasa >= 50 ? '#2e7d32' : tasa >= 25 ? '#f57f17' : '#c62828';

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  const lineOpts = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} incidente${ctx.parsed.y !== 1 ? 's' : ''}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Dashboard Estadístico</h1>
            <p style={s.subtitle}>Resumen operativo de la unidad policial</p>
          </div>
          <div style={s.tasaBox}>
            <div style={s.tasaLabel}>Tasa de Recuperación</div>
            <div style={{ ...s.tasaValor, color: tasaColor }}>
              {tasa}%
            </div>
            <div style={s.tasaBar}>
              <div style={{
                ...s.tasaFill,
                width: `${Math.min(tasa, 100)}%`,
                background: tasaColor
              }} />
            </div>
            <div style={s.tasaHint}>
              {stats.vehiculosRecuperados} de{' '}
              {stats.vehiculosRobados + stats.vehiculosHurtados + stats.vehiculosRecuperados}{' '}
              vehículos
            </div>
          </div>
        </div>

        {/* Tarjetas */}
        <div style={s.grid}>
          {cards.map(card => (
            <div key={card.label} style={s.card}>
              <div style={s.cardIcon}>{card.icon}</div>
              <div style={{ ...s.cardValue, color: card.color }}>
                {card.value}
              </div>
              <div style={s.cardLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Fila 1: Tendencia mensual + Donut */}
        <div style={s.chartsRow}>
          <div style={{ ...s.chartBox, flex: 2 }}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>📈 Tendencia Mensual</h3>
              <span style={s.chartSub}>Últimos 12 meses</span>
            </div>
            {tendencia.length > 0 ? (
              <Line data={lineData} options={lineOpts} />
            ) : (
              <div style={s.sinDatos}>Sin datos de tendencia</div>
            )}
          </div>

          <div style={{ ...s.chartBox, flex: 1 }}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>🍩 Tipos de Delito</h3>
            </div>
            <Doughnut data={donutData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </div>
        </div>

        {/* Fila 2: Estado + Día de semana */}
        <div style={s.chartsRow}>
          <div style={{ ...s.chartBox, flex: 1 }}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>📊 Estado de Incidentes</h3>
            </div>
            <Bar data={barEstadoData} options={chartOpts} />
          </div>

          <div style={{ ...s.chartBox, flex: 1 }}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>📅 Incidentes por Día</h3>
              <span style={s.chartSub}>
                Rojo = fin de semana
              </span>
            </div>
            {diasSemana.length > 0 ? (
              <Bar data={barDiaData} options={chartOpts} />
            ) : (
              <div style={s.sinDatos}>Sin datos</div>
            )}
          </div>
        </div>

        {/* Fila 3: Resumen numérico */}
        <div style={s.resumenRow}>
          <div style={s.resumenCard}>
            <div style={s.resumenIcon}>🔓</div>
            <div style={s.resumenValor}>{stats.incidentesAbiertos}</div>
            <div style={s.resumenLabel}>Casos Abiertos</div>
            <div style={{ ...s.resumenBarra, background: '#ffebee' }}>
              <div style={{
                ...s.resumenFill,
                width: stats.totalIncidentes > 0
                  ? `${(stats.incidentesAbiertos / stats.totalIncidentes) * 100}%`
                  : '0%',
                background: '#ef5350'
              }} />
            </div>
          </div>

          <div style={s.resumenCard}>
            <div style={s.resumenIcon}>🔍</div>
            <div style={s.resumenValor}>{stats.incidentesEnInvestigacion}</div>
            <div style={s.resumenLabel}>En Investigación</div>
            <div style={{ ...s.resumenBarra, background: '#fff8e1' }}>
              <div style={{
                ...s.resumenFill,
                width: stats.totalIncidentes > 0
                  ? `${(stats.incidentesEnInvestigacion / stats.totalIncidentes) * 100}%`
                  : '0%',
                background: '#ff9800'
              }} />
            </div>
          </div>

          <div style={s.resumenCard}>
            <div style={s.resumenIcon}>✅</div>
            <div style={s.resumenValor}>{stats.incidentesCerrados}</div>
            <div style={s.resumenLabel}>Casos Cerrados</div>
            <div style={{ ...s.resumenBarra, background: '#e8f5e9' }}>
              <div style={{
                ...s.resumenFill,
                width: stats.totalIncidentes > 0
                  ? `${(stats.incidentesCerrados / stats.totalIncidentes) * 100}%`
                  : '0%',
                background: '#66bb6a'
              }} />
            </div>
          </div>

          <div style={s.resumenCard}>
            <div style={s.resumenIcon}>📅</div>
            <div style={s.resumenValor}>{stats.incidentesEsteMes}</div>
            <div style={s.resumenLabel}>Este Mes</div>
            <div style={{ ...s.resumenBarra, background: '#e3f2fd' }}>
              <div style={{
                ...s.resumenFill,
                width: stats.totalIncidentes > 0
                  ? `${Math.min((stats.incidentesEsteMes / stats.totalIncidentes) * 100, 100)}%`
                  : '0%',
                background: '#42a5f5'
              }} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

const s = {
  layout: { display: 'flex', fontFamily: 'system-ui, sans-serif' },
  main: {
    marginLeft: '240px', flex: 1, padding: '32px',
    minHeight: '100vh', background: '#f5f7fa'
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', gap: '16px', color: '#666'
  },
  loadingSpinner: { fontSize: '48px', animation: 'pulse 1s infinite' },
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px', gap: '16px'
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#0d1b2a', margin: '0 0 4px 0' },
  subtitle: { color: '#666', margin: 0, fontSize: '14px' },

  // Tasa de recuperación
  tasaBox: {
    background: 'white', borderRadius: '12px',
    padding: '16px 20px', minWidth: '200px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  tasaLabel: { fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: '4px' },
  tasaValor: { fontSize: '32px', fontWeight: '800', lineHeight: 1, marginBottom: '8px' },
  tasaBar: { height: '8px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '6px', overflow: 'hidden' },
  tasaFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s' },
  tasaHint: { fontSize: '11px', color: '#888' },

  // Tarjetas
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px', marginBottom: '24px'
  },
  card: {
    background: 'white', borderRadius: '12px',
    padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s'
  },
  cardIcon: { fontSize: '28px', marginBottom: '8px' },
  cardValue: { fontSize: '36px', fontWeight: '800', lineHeight: 1 },
  cardLabel: { fontSize: '12px', color: '#666', marginTop: '6px', fontWeight: '500' },

  // Gráficas
  chartsRow: {
    display: 'flex', gap: '20px',
    marginBottom: '20px', flexWrap: 'wrap'
  },
  chartBox: {
    background: 'white', borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    minWidth: '280px'
  },
  chartHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px'
  },
  chartTitle: { fontSize: '15px', fontWeight: '700', color: '#0d1b2a', margin: 0 },
  chartSub: { fontSize: '12px', color: '#888' },
  sinDatos: { padding: '40px', textAlign: 'center', color: '#bbb', fontSize: '14px' },

  // Resumen con barras
  resumenRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  resumenCard: {
    background: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  resumenIcon: { fontSize: '24px', marginBottom: '8px' },
  resumenValor: { fontSize: '32px', fontWeight: '800', color: '#0d1b2a', lineHeight: 1 },
  resumenLabel: { fontSize: '13px', color: '#666', margin: '6px 0 12px' },
  resumenBarra: { height: '8px', borderRadius: '4px', overflow: 'hidden' },
  resumenFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s' }
};