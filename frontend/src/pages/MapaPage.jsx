import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../components/layout/Sidebar';
import api from '../api/axios';

const COLORES = {
  ROBO:        '#ef5350',
  HURTO:       '#ff9800',
  RECUPERACION:'#66bb6a',
  HALLAZGO:    '#42a5f5'
};

export default function MapaPage() {
  const [geojson,   setGeojson]   = useState(null);
  const [filtro,    setFiltro]    = useState('');
  const [loading,   setLoading]   = useState(true);

  const cargarDatos = async (tipo = '') => {
    setLoading(true);
    try {
      const params = tipo ? `?tipoDelito=${tipo}` : '';
      const { data } = await api.get(`/mapa/geojson${params}`);
      setGeojson(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleFiltro = e => {
    setFiltro(e.target.value);
    cargarDatos(e.target.value);
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Mapa del Delito</h1>
            <p style={styles.subtitle}>
              Georreferenciación de incidentes vehiculares — Trujillo, La Libertad
            </p>
          </div>
          <select
            value={filtro}
            onChange={handleFiltro}
            style={styles.select}
          >
            <option value="">Todos los delitos</option>
            <option value="ROBO">Robos</option>
            <option value="HURTO">Hurtos</option>
            <option value="RECUPERACION">Recuperaciones</option>
            <option value="HALLAZGO">Hallazgos</option>
          </select>
        </div>

        {/* Leyenda */}
        <div style={styles.leyenda}>
          {Object.entries(COLORES).map(([tipo, color]) => (
            <div key={tipo} style={styles.leyendaItem}>
              <div style={{
                ...styles.leyendaDot,
                background: color
              }} />
              <span style={styles.leyendaLabel}>{tipo}</span>
            </div>
          ))}
          <div style={styles.leyendaItem}>
            <span style={styles.contador}>
              {geojson?.features?.length || 0} eventos
            </span>
          </div>
        </div>

        {/* Mapa */}
        <div style={styles.mapaContainer}>
          <MapContainer
            center={[-8.1116, -79.0288]}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />

            {!loading && geojson?.features?.map((feature, i) => {
              const [lng, lat] = feature.geometry.coordinates;
              const p = feature.properties;
              const color = COLORES[p.tipoDelito] || '#999';

              return (
                <CircleMarker
                  key={i}
                  center={[lat, lng]}
                  radius={10}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={styles.popup}>
                      <div style={{
                        ...styles.popupBadge,
                        background: color
                      }}>
                        {p.tipoDelitoLabel}
                      </div>
                      <h4 style={styles.popupCaso}>{p.numeroCaso}</h4>
                      <table style={styles.popupTable}>
                        <tbody>
                          <tr>
                            <td style={styles.popupKey}>Fecha</td>
                            <td style={styles.popupVal}>{p.fechaHecho}</td>
                          </tr>
                          <tr>
                            <td style={styles.popupKey}>Estado</td>
                            <td style={styles.popupVal}>{p.estadoLabel}</td>
                          </tr>
                          <tr>
                            <td style={styles.popupKey}>Placa(s)</td>
                            <td style={styles.popupVal}>
                              {p.placas?.join(', ') || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td style={styles.popupKey}>Dirección</td>
                            <td style={styles.popupVal}>
                              {p.direccion || '-'}
                            </td>
                          </tr>
                          {p.sirdic && (
                            <tr>
                              <td style={styles.popupKey}>SIRDIC</td>
                              <td style={styles.popupVal}>{p.sirdic}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {p.descripcion && (
                        <p style={styles.popupDesc}>{p.descripcion}</p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {loading && (
            <div style={styles.loadingOverlay}>
              Cargando eventos...
            </div>
          )}
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
    background: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  title: { fontSize: '28px', fontWeight: '800',
    color: '#0d1b2a', margin: '0 0 4px 0' },
  subtitle: { color: '#666', margin: 0, fontSize: '14px' },
  select: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  leyenda: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  leyendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  leyendaDot: {
    width: '12px', height: '12px',
    borderRadius: '50%'
  },
  leyendaLabel: {
    fontSize: '12px',
    color: '#555',
    fontWeight: '500'
  },
  contador: {
    fontSize: '13px',
    color: '#1565c0',
    fontWeight: '700',
    marginLeft: '8px'
  },
  mapaContainer: {
    flex: 1,
    minHeight: '500px',
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#666'
  },
  popup: { minWidth: '200px', fontFamily: 'system-ui, sans-serif' },
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
    color: '#0d1b2a'
  },
  popupTable: { width: '100%', borderCollapse: 'collapse' },
  popupKey: {
    fontSize: '11px',
    color: '#888',
    fontWeight: '600',
    paddingRight: '8px',
    paddingBottom: '4px',
    whiteSpace: 'nowrap'
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
    borderTop: '1px solid #eee',
    paddingTop: '8px'
  }
};