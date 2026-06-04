import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../components/layout/Sidebar';
import HeatmapLayer from '../components/mapa/HeatmapLayer';
import api from '../api/axios';

const COLORES = {
  ROBO:        '#ef5350',
  HURTO:       '#ff9800',
  RECUPERACION:'#66bb6a',
  HALLAZGO:    '#42a5f5'
};

const TIPO_LABEL = {
  ROBO:'Robo', HURTO:'Hurto',
  RECUPERACION:'Recuperación', HALLAZGO:'Hallazgo'
};

// Rangos de fecha predefinidos para acceso rápido
const RANGOS = [
  { label: 'Hoy',         dias: 0  },
  { label: 'Últimos 7 días',  dias: 7  },
  { label: 'Últimos 30 días', dias: 30 },
  { label: 'Últimos 90 días', dias: 90 },
  { label: 'Este año',    dias: 365 },
];

const hoy = () => new Date().toISOString().slice(0, 10);

const restarDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
};

export default function MapaPage() {
  const [geojson,      setGeojson]      = useState(null);
  const [heatData,     setHeatData]     = useState([]);
  const [filtroTipo,   setFiltroTipo]   = useState('');
  const [filtroDesde,  setFiltroDesde]  = useState('');
  const [filtroHasta,  setFiltroHasta]  = useState('');
  const [rangoActivo,  setRangoActivo]  = useState('');
  const [loading,      setLoading]      = useState(true);
  const [vistaActual,  setVistaActual]  = useState('marcadores');

  const cargarDatos = async (tipo = '', desde = '', hasta = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tipo)  params.append('tipoDelito', tipo);
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      const qs = params.toString() ? `?${params}` : '';

      const [geoRes, heatRes] = await Promise.all([
        api.get(`/mapa/geojson${qs}`),
        api.get(`/mapa/heatmap${qs}`)
      ]);
      setGeojson(geoRes.data);
      setHeatData(heatRes.data);
    } catch (err) {
      console.error('Error al cargar datos del mapa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const aplicarFiltros = () => {
    cargarDatos(filtroTipo, filtroDesde, filtroHasta);
  };

  const aplicarRango = (dias) => {
    const desde = dias === 0 ? hoy() : restarDias(dias);
    const hasta = hoy();
    setFiltroDesde(desde);
    setFiltroHasta(hasta);
    setRangoActivo(String(dias));
    cargarDatos(filtroTipo, desde, hasta);
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroDesde('');
    setFiltroHasta('');
    setRangoActivo('');
    cargarDatos('', '', '');
  };

  const hayFiltros = filtroTipo || filtroDesde || filtroHasta;
  const totalEventos = geojson?.features?.length || 0;

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Mapa del Delito</h1>
            <p style={s.subtitle}>
              Georreferenciación de incidentes vehiculares — Trujillo, La Libertad
            </p>
          </div>
          <div style={s.toggleVista}>
            <button style={{ ...s.btnVista, ...(vistaActual === 'marcadores' ? s.btnVistaActivo : {}) }}
              onClick={() => setVistaActual('marcadores')}>
              📍 Marcadores
            </button>
            <button style={{ ...s.btnVista, ...(vistaActual === 'calor' ? s.btnVistaActivo : {}) }}
              onClick={() => setVistaActual('calor')}>
              🔥 Mapa de Calor
            </button>
          </div>
        </div>

        {/* ── PANEL DE FILTROS ── */}
        <div style={s.filtrosPanel}>

          {/* Fila 1: Rangos rápidos */}
          <div style={s.filtrosFila}>
            <span style={s.filtrosLabel}>⚡ Acceso rápido:</span>
            <div style={s.rangosRow}>
              {RANGOS.map(r => (
                <button key={r.dias}
                  style={{
                    ...s.btnRango,
                    ...(rangoActivo === String(r.dias) ? s.btnRangoActivo : {})
                  }}
                  onClick={() => aplicarRango(r.dias)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Filtros manuales */}
          <div style={s.filtrosFila}>
            <span style={s.filtrosLabel}>🔍 Filtros:</span>
            <div style={s.filtrosControles}>

              <select style={s.select} value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}>
                <option value="">Todos los tipos</option>
                <option value="ROBO">Robos</option>
                <option value="HURTO">Hurtos</option>
                <option value="RECUPERACION">Recuperaciones</option>
                <option value="HALLAZGO">Hallazgos</option>
              </select>

              <div style={s.fechaGroup}>
                <label style={s.fechaLabel}>Desde</label>
                <input style={s.inputFecha} type="date"
                  value={filtroDesde}
                  max={filtroHasta || hoy()}
                  onChange={e => {
                    setFiltroDesde(e.target.value);
                    setRangoActivo('');
                  }} />
              </div>

              <div style={s.fechaGroup}>
                <label style={s.fechaLabel}>Hasta</label>
                <input style={s.inputFecha} type="date"
                  value={filtroHasta}
                  min={filtroDesde}
                  max={hoy()}
                  onChange={e => {
                    setFiltroHasta(e.target.value);
                    setRangoActivo('');
                  }} />
              </div>

              <button style={s.btnAplicar} onClick={aplicarFiltros}>
                🗺️ Aplicar
              </button>

              {hayFiltros && (
                <button style={s.btnLimpiar} onClick={limpiarFiltros}>
                  ✕ Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Fila 3: Leyenda y contador */}
          <div style={s.filtrosFila}>
            {vistaActual === 'marcadores' ? (
              <>
                {Object.entries(COLORES).map(([tipo, color]) => (
                  <div key={tipo} style={s.leyendaItem}>
                    <div style={{ ...s.leyendaDot, background: color }} />
                    <span style={s.leyendaLabel}>{TIPO_LABEL[tipo]}</span>
                  </div>
                ))}
                <div style={s.contadorBadge}>
                  {loading ? '...' : `${totalEventos} evento${totalEventos !== 1 ? 's' : ''}`}
                  {hayFiltros && <span style={s.filtradoBadge}> filtrado</span>}
                </div>
              </>
            ) : (
              <>
                <div style={s.gradienteCalor}>
                  <span style={s.gradienteLabel}>Baja densidad</span>
                  <div style={s.gradienteBarra} />
                  <span style={s.gradienteLabel}>Alta densidad</span>
                </div>
                <div style={s.contadorBadge}>
                  🔥 {heatData.length} punto{heatData.length !== 1 ? 's' : ''}
                  {hayFiltros && <span style={s.filtradoBadge}> filtrado</span>}
                </div>
              </>
            )}

            {/* Resumen del filtro activo */}
            {hayFiltros && (
              <div style={s.resumenFiltro}>
                {filtroTipo && <span style={s.tagFiltro}>Tipo: {TIPO_LABEL[filtroTipo]}</span>}
                {filtroDesde && <span style={s.tagFiltro}>Desde: {filtroDesde}</span>}
                {filtroHasta && <span style={s.tagFiltro}>Hasta: {filtroHasta}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div style={s.mapaContenedor}>
          <MapContainer
            center={[-8.1116, -79.0288]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {vistaActual === 'marcadores' && !loading &&
              geojson?.features?.map((feature, i) => {
                const [lng, lat] = feature.geometry.coordinates;
                const p = feature.properties;
                const color = COLORES[p.tipoDelito] || '#999';
                return (
                  <CircleMarker key={i} center={[lat, lng]} radius={10}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}>
                    <Popup maxWidth={260}>
                      <div style={s.popup}>
                        <div style={{ ...s.popupBadge, background: color }}>
                          {TIPO_LABEL[p.tipoDelito] || p.tipoDelito}
                        </div>
                        <h4 style={s.popupCaso}>{p.numeroCaso}</h4>
                        <table style={s.popupTable}>
                          <tbody>
                            <tr><td style={s.popupKey}>Fecha</td><td style={s.popupVal}>{p.fechaHecho}</td></tr>
                            <tr><td style={s.popupKey}>Estado</td><td style={s.popupVal}>{p.estadoLabel}</td></tr>
                            <tr><td style={s.popupKey}>Placa(s)</td><td style={s.popupVal}>{p.placas?.join(', ') || '-'}</td></tr>
                            {p.direccion && <tr><td style={s.popupKey}>Dirección</td><td style={s.popupVal}>{p.direccion}</td></tr>}
                            {p.sirdic && <tr><td style={s.popupKey}>SIRDIC</td><td style={s.popupVal}>{p.sirdic}</td></tr>}
                          </tbody>
                        </table>
                        {p.descripcion && <p style={s.popupDesc}>{p.descripcion}</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })
            }

            {vistaActual === 'calor' && !loading && heatData.length > 0 && (
              <HeatmapLayer puntos={heatData} />
            )}
          </MapContainer>

          {loading && (
            <div style={s.loadingOverlay}>
              <div style={s.loadingSpinner}>🗺️ Cargando datos del mapa...</div>
            </div>
          )}

          {!loading && vistaActual === 'marcadores' && totalEventos === 0 && (
            <div style={s.sinDatos}>
              No hay incidentes para los filtros seleccionados
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

const s = {
  layout: { display: 'flex', fontFamily: 'system-ui, sans-serif' },
  main: {
    marginLeft: '240px', flex: 1, padding: '32px',
    minHeight: '100vh', background: '#f5f7fa',
    display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '16px', gap: '12px'
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#0d1b2a', margin: '0 0 4px 0' },
  subtitle: { color: '#666', margin: 0, fontSize: '14px' },
  toggleVista: {
    display: 'flex', borderRadius: '8px',
    overflow: 'hidden', border: '2px solid #e0e0e0', background: 'white'
  },
  btnVista: {
    padding: '10px 18px', border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    color: '#666', transition: 'all 0.2s'
  },
  btnVistaActivo: { background: '#0d1b2a', color: 'white' },

  // Panel de filtros
  filtrosPanel: {
    background: 'white', borderRadius: '12px',
    padding: '16px 20px', marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  filtrosFila: {
    display: 'flex', alignItems: 'center',
    gap: '12px', flexWrap: 'wrap'
  },
  filtrosLabel: {
    fontSize: '13px', fontWeight: '700',
    color: '#555', minWidth: '120px'
  },
  rangosRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btnRango: {
    padding: '6px 14px', borderRadius: '20px',
    border: '2px solid #e0e0e0', background: 'white',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    color: '#555', transition: 'all 0.2s'
  },
  btnRangoActivo: {
    background: '#0d1b2a', color: 'white',
    borderColor: '#0d1b2a'
  },
  filtrosControles: {
    display: 'flex', gap: '10px',
    alignItems: 'center', flexWrap: 'wrap'
  },
  select: {
    padding: '8px 14px', borderRadius: '8px',
    border: '2px solid #e0e0e0', fontSize: '13px',
    background: 'white', cursor: 'pointer', outline: 'none'
  },
  fechaGroup: {
    display: 'flex', flexDirection: 'column', gap: '2px'
  },
  fechaLabel: {
    fontSize: '11px', fontWeight: '600',
    color: '#888', textTransform: 'uppercase'
  },
  inputFecha: {
    padding: '8px 12px', borderRadius: '8px',
    border: '2px solid #e0e0e0', fontSize: '13px',
    outline: 'none', cursor: 'pointer'
  },
  btnAplicar: {
    padding: '9px 20px', background: '#1565c0',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '700'
  },
  btnLimpiar: {
    padding: '9px 16px', background: '#ffebee',
    color: '#c62828', border: '2px solid #ffcdd2',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600'
  },
  leyendaItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  leyendaDot: { width: '12px', height: '12px', borderRadius: '50%' },
  leyendaLabel: { fontSize: '12px', color: '#555', fontWeight: '500' },
  contadorBadge: {
    marginLeft: 'auto', fontSize: '13px', color: '#1565c0',
    fontWeight: '700', background: '#e3f2fd',
    padding: '4px 12px', borderRadius: '20px'
  },
  filtradoBadge: { color: '#f57f17', fontSize: '11px' },
  gradienteCalor: { display: 'flex', alignItems: 'center', gap: '8px' },
  gradienteBarra: {
    width: '120px', height: '12px', borderRadius: '6px',
    background: 'linear-gradient(to right, #00f, #0ff, #0f0, #ff0, #f00)'
  },
  gradienteLabel: { fontSize: '11px', color: '#666' },
  resumenFiltro: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '8px' },
  tagFiltro: {
    background: '#e8f5e9', color: '#2e7d32',
    padding: '3px 10px', borderRadius: '12px',
    fontSize: '11px', fontWeight: '600'
  },
  mapaContenedor: {
    flex: 1, minHeight: '480px', position: 'relative',
    borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  },
  loadingOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(255,255,255,0.85)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  loadingSpinner: { fontSize: '16px', color: '#666', fontWeight: '500' },
  sinDatos: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'rgba(255,255,255,0.8)',
    fontSize: '16px', color: '#666', zIndex: 500
  },
  popup: { minWidth: '200px', fontFamily: 'system-ui, sans-serif' },
  popupBadge: {
    color: 'white', padding: '3px 10px', borderRadius: '12px',
    fontSize: '11px', fontWeight: '700',
    display: 'inline-block', marginBottom: '8px'
  },
  popupCaso: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#0d1b2a' },
  popupTable: { width: '100%', borderCollapse: 'collapse' },
  popupKey: { fontSize: '11px', color: '#888', fontWeight: '600', paddingRight: '8px', paddingBottom: '4px', whiteSpace: 'nowrap', verticalAlign: 'top' },
  popupVal: { fontSize: '12px', color: '#333', paddingBottom: '4px' },
  popupDesc: { fontSize: '12px', color: '#555', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', lineHeight: '1.4' }
};