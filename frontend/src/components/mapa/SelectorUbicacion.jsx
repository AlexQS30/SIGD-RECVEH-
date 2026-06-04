import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
 
// Fix ícono Leaflet en Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
 
// Captura el clic en el mapa
function ClickHandler({ onUbicacionSeleccionada }) {
  useMapEvents({
    click(e) {
      onUbicacionSeleccionada({
        latitud:  e.latlng.lat,
        longitud: e.latlng.lng
      });
    }
  });
  return null;
}
 
// Centro: Trujillo, La Libertad, Perú
const CENTRO = [-8.1116, -79.0288];
 
export default function SelectorUbicacion({ value, onChange }) {
  const [show,    setShow]    = useState(false);
  const [marcador, setMarcador] = useState(
    value?.latitud && value?.longitud
      ? { lat: parseFloat(value.latitud), lng: parseFloat(value.longitud) }
      : null
  );
 
  // Sincroniza el marcador si el valor externo cambia
  useEffect(() => {
    if (value?.latitud && value?.longitud) {
      setMarcador({
        lat: parseFloat(value.latitud),
        lng: parseFloat(value.longitud)
      });
    }
  }, [value?.latitud, value?.longitud]);
 
  const handleMapClick = useCallback(({ latitud, longitud }) => {
    const lat = parseFloat(latitud.toFixed(6));
    const lng = parseFloat(longitud.toFixed(6));
    setMarcador({ lat, lng });
    onChange({
      ...value,
      latitud:  lat.toString(),
      longitud: lng.toString()
    });
  }, [value, onChange]);
 
  const handleConfirmar = () => {
    if (marcador) setShow(false);
  };
 
  const tieneCoordenadas = value?.latitud && value?.longitud;
 
  return (
    <div>
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setShow(true)}
        style={{
          ...s.btnMapa,
          borderColor: tieneCoordenadas ? '#43a047' : '#1565c0',
          background:  tieneCoordenadas ? '#e8f5e9' : '#e3f2fd',
          color:       tieneCoordenadas ? '#2e7d32' : '#1565c0',
        }}
      >
        {tieneCoordenadas
          ? `✅ Ubicación marcada — ${parseFloat(value.latitud).toFixed(4)}, ${parseFloat(value.longitud).toFixed(4)}`
          : '🗺️ Hacer clic aquí para seleccionar ubicación en el mapa'
        }
      </button>
 
      {/* Info de coordenadas */}
      {tieneCoordenadas && (
        <div style={s.coordsBox}>
          <span style={s.coordItem}>
            📍 Lat: <strong>{parseFloat(value.latitud).toFixed(6)}</strong>
          </span>
          <span style={s.coordItem}>
            Lng: <strong>{parseFloat(value.longitud).toFixed(6)}</strong>
          </span>
          {value.direccionReferencia && (
            <span style={s.coordDir}>
              📌 {value.direccionReferencia}
            </span>
          )}
          <button
            type="button"
            style={s.btnLimpiar}
            onClick={() => {
              setMarcador(null);
              onChange({
                ...value,
                latitud: '', longitud: '',
                direccionReferencia: ''
              });
            }}
          >
            ✕ Limpiar
          </button>
        </div>
      )}
 
      {/* ── MODAL DEL MAPA ── */}
      {show && (
        <div style={s.overlay}>
          <div style={s.mapaModal}>
 
            {/* Header */}
            <div style={s.mapaHeader}>
              <div>
                <h3 style={s.mapaTitle}>
                  📍 Seleccionar ubicación del hecho
                </h3>
                <p style={s.mapaSubtitle}>
                  Haz clic en el mapa para marcar el lugar exacto
                </p>
              </div>
              <button
                type="button"
                style={s.btnClose}
                onClick={() => setShow(false)}
              >
                ✕
              </button>
            </div>
 
            {/* Barra de estado */}
            <div style={marcador ? s.barraOk : s.barraEmpty}>
              {marcador
                ? `✅ Marcado: ${marcador.lat.toFixed(6)}, ${marcador.lng.toFixed(6)} — Puedes mover el marcador haciendo clic de nuevo`
                : '👆 Haz clic en el mapa para seleccionar la ubicación del incidente'
              }
            </div>
 
            {/* MAPA — altura fija obligatoria para Leaflet */}
            <div style={s.mapaContenedor}>
              <MapContainer
                center={CENTRO}
                zoom={14}
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <ClickHandler
                  onUbicacionSeleccionada={handleMapClick}
                />
                {marcador && (
                  <Marker position={[marcador.lat, marcador.lng]} />
                )}
              </MapContainer>
            </div>
 
            {/* Dirección de referencia */}
            <div style={s.direccionBox}>
              <label style={s.label}>
                Dirección de referencia
              </label>
              <input
                style={s.input}
                placeholder="Ej: Av. España cdra. 5, frente al BCP, Trujillo"
                value={value?.direccionReferencia || ''}
                onChange={e => onChange({
                  ...value,
                  direccionReferencia: e.target.value
                })}
              />
            </div>
 
            {/* Footer */}
            <div style={s.mapaFooter}>
              <p style={s.hint}>
                💡 <strong>Consejo:</strong> Para mayor precisión,
                busca la dirección en Google Maps → clic derecho →
                "¿Qué hay aquí?" → copia las coordenadas y haz clic
                en ese punto del mapa.
              </p>
              <div style={s.mapaActions}>
                <button
                  type="button"
                  style={s.btnCancelar}
                  onClick={() => setShow(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!marcador}
                  style={{
                    ...s.btnConfirmar,
                    opacity: marcador ? 1 : 0.4,
                    cursor:  marcador ? 'pointer' : 'not-allowed'
                  }}
                  onClick={handleConfirmar}
                >
                  ✅ Confirmar ubicación
                </button>
              </div>
            </div>
 
          </div>
        </div>
      )}
    </div>
  );
}
 
const s = {
  btnMapa: {
    width: '100%',
    padding: '14px 16px',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  coordsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
    padding: '10px 14px',
    background: '#e8f5e9',
    borderRadius: '8px',
    flexWrap: 'wrap'
  },
  coordItem: {
    fontSize: '13px',
    color: '#2e7d32'
  },
  coordDir: {
    fontSize: '12px',
    color: '#388e3c',
    fontStyle: 'italic'
  },
  btnLimpiar: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: 'auto',
    padding: '2px 6px'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '16px'
  },
  mapaModal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
    overflow: 'hidden'
  },
  mapaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f0f0f0'
  },
  mapaTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0d1b2a',
    margin: '0 0 4px 0'
  },
  mapaSubtitle: {
    fontSize: '13px',
    color: '#666',
    margin: 0
  },
  btnClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px 8px',
    lineHeight: 1
  },
  barraOk: {
    padding: '10px 24px',
    background: '#e8f5e9',
    color: '#2e7d32',
    fontSize: '13px',
    fontWeight: '500'
  },
  barraEmpty: {
    padding: '10px 24px',
    background: '#fff8e1',
    color: '#f57f17',
    fontSize: '13px',
    fontWeight: '500'
  },
  // CLAVE: el contenedor del mapa necesita altura explícita
  mapaContenedor: {
    height: '400px',
    width: '100%'
  },
  direccionBox: {
    padding: '14px 24px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  mapaFooter: {
    padding: '14px 24px',
    borderTop: '1px solid #f0f0f0',
    background: '#f8f9fa'
  },
  hint: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 12px 0',
    lineHeight: '1.5'
  },
  mapaActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  btnCancelar: {
    padding: '10px 24px',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  btnConfirmar: {
    padding: '10px 24px',
    background: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'opacity 0.2s'
  }
};