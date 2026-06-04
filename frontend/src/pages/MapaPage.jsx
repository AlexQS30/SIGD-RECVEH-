import { useEffect, useState } from 'react';
import {
  MapContainer, TileLayer,
  CircleMarker, Popup
} from 'react-leaflet';
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

export default function MapaPage() {
  const [geojson,    setGeojson]    = useState(null);
  const [heatData,   setHeatData]   = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [vistaActual,setVistaActual]= useState('marcadores'); // 'marcadores' | 'calor'

  const cargarDatos = async (tipo = '') => {
    setLoading(true);
    try {
      const params = tipo ? `?tipoDelito=${tipo}` : '';

      const [geoRes, heatRes] = await Promise.all([
        api.get(`/mapa/geojson${params}`),
        api.get(`/mapa/heatmap${params}`)
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

  const handleFiltro = e => {
    setFiltroTipo(e.target.value);
    cargarDatos(e.target.value);
  };

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
              Georreferenciación de incidentes vehiculares —
              Trujillo, La Libertad
            </p>
          </div>

          <div style={s.controles}>
            {/* Filtro por tipo */}
            <select
              style={s.select}
              value={filtroTipo}
              onChange={handleFiltro}
            >
              <option value="">Todos los delitos</option>
              <option value="ROBO">Robos</option>
              <option value="HURTO">Hurtos</option>
              <option value="RECUPERACION">Recuperaciones</option>
              <option value="HALLAZGO">Hallazgos</option>
            </select>

            {/* Toggle vista */}
            <div style={s.toggleVista}>
              <button
                style={{
                  ...s.btnVista,
                  ...(vistaActual === 'marcadores'
                    ? s.btnVistaActivo : {})
                }}
                onClick={() => setVistaActual('marcadores')}
              >
                📍 Marcadores
              </button>
              <button
                style={{
                  ...s.btnVista,
                  ...(vistaActual === 'calor'
                    ? s.btnVistaActivo : {})
                }}
                onClick={() => setVistaActual('calor')}
              >
                🔥 Mapa de Calor
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda y contador */}
        <div style={s.infoBar}>
          {vistaActual === 'marcadores' ? (
            <>
              {Object.entries(COLORES).map(([tipo, color]) => (
                <div key={tipo} style={s.leyendaItem}>
                  <div style={{
                    ...s.leyendaDot,
                    background: color
                  }} />
                  <span style={s.leyendaLabel}>
                    {TIPO_LABEL[tipo]}
                  </span>
                </div>
              ))}
              <div style={s.contadorBadge}>
                {loading ? '...' : `${totalEventos} evento${totalEventos !== 1 ? 's' : ''}`}
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
                🔥 {heatData.length} punto{heatData.length !== 1 ? 's' : ''} de calor
              </div>
              <div style={s.heatHint}>
                Las zonas rojas indican mayor concentración de incidentes
              </div>
            </>
          )}
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

            {/* Vista marcadores */}
            {vistaActual === 'marcadores' &&
              !loading &&
              geojson?.features?.map((feature, i) => {
                const [lng, lat] = feature.geometry.coordinates;
                const p = feature.properties;
                const color = COLORES[p.tipoDelito] || '#999';

                return (
                  <CircleMarker
                    key={i}
                    center={[lat, lng]}
                    radius={10}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.85,
                      weight: 2
                    }}
                  >
                    <Popup maxWidth={260}>
                      <div style={s.popup}>
                        <div style={{
                          ...s.popupBadge,
                          background: color
                        }}>
                          {TIPO_LABEL[p.tipoDelito] || p.tipoDelito}
                        </div>
                        <h4 style={s.popupCaso}>
                          {p.numeroCaso}
                        </h4>
                        <table style={s.popupTable}>
                          <tbody>
                            <tr>
                              <td style={s.popupKey}>Fecha</td>
                              <td style={s.popupVal}>
                                {p.fechaHecho}
                              </td>
                            </tr>
                            <tr>
                              <td style={s.popupKey}>Estado</td>
                              <td style={s.popupVal}>
                                {p.estadoLabel}
                              </td>
                            </tr>
                            <tr>
                              <td style={s.popupKey}>Placa(s)</td>
                              <td style={s.popupVal}>
                                {p.placas?.join(', ') || '-'}
                              </td>
                            </tr>
                            {p.direccion && (
                              <tr>
                                <td style={s.popupKey}>
                                  Dirección
                                </td>
                                <td style={s.popupVal}>
                                  {p.direccion}
                                </td>
                              </tr>
                            )}
                            {p.sirdic && (
                              <tr>
                                <td style={s.popupKey}>
                                  SIRDIC
                                </td>
                                <td style={s.popupVal}>
                                  {p.sirdic}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        {p.descripcion && (
                          <p style={s.popupDesc}>
                            {p.descripcion}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })
            }

            {/* Vista mapa de calor */}
            {vistaActual === 'calor' &&
              !loading &&
              heatData.length > 0 && (
                <HeatmapLayer puntos={heatData} />
              )
            }

          </MapContainer>

          {/* Loading overlay */}
          {loading && (
            <div style={s.loadingOverlay}>
              <div style={s.loadingSpinner}>
                🗺️ Cargando datos del mapa...
              </div>
            </div>
          )}

          {/* Sin datos */}
          {!loading &&
           vistaActual === 'marcadores' &&
           totalEventos === 0 && (
            <div style={s.sinDatos}>
              No hay incidentes registrados
              {filtroTipo && ` del tipo "${TIPO_LABEL[filtroTipo]}"`}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

const s = {
  layout: {
    display: 'flex',
    fontFamily: 'system-ui, sans-serif'
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    minHeight: '100vh',
    background: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0d1b2a',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#666',
    margin: 0,
    fontSize: '14px'
  },
  controles: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  select: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  toggleVista: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e0e0e0',
    background: 'white'
  },
  btnVista: {
    padding: '10px 18px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.2s'
  },
  btnVistaActivo: {
    background: '#0d1b2a',
    color: 'white'
  },
  infoBar: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    minHeight: '32px'
  },
  leyendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  leyendaDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  leyendaLabel: {
    fontSize: '12px',
    color: '#555',
    fontWeight: '500'
  },
  contadorBadge: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#1565c0',
    fontWeight: '700',
    background: '#e3f2fd',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  gradienteCalor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  gradienteBarra: {
    width: '120px',
    height: '12px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #00f, #0ff, #0f0, #ff0, #f00)'
  },
  gradienteLabel: {
    fontSize: '11px',
    color: '#666'
  },
  heatHint: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic'
  },
  mapaContenedor: {
    flex: 1,
    minHeight: '520px',
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  loadingSpinner: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  sinDatos: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.8)',
    fontSize: '16px',
    color: '#666',
    zIndex: 500
  },
  popup: {
    minWidth: '200px',
    fontFamily: 'system-ui, sans-serif'
  },
  popupBadge: {
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '8px'
  },
  popupCaso: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0d1b2a'
  },
  popupTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  popupKey: {
    fontSize: '11px',
    color: '#888',
    fontWeight: '600',
    paddingRight: '8px',
    paddingBottom: '4px',
    whiteSpace: 'nowrap',
    verticalAlign: 'top'
  },
  popupVal: {
    fontSize: '12px',
    color: '#333',
    paddingBottom: '4px'
  },
  popupDesc: {
    fontSize: '12px',
    color: '#555',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #eee',
    lineHeight: '1.4'
  }
};