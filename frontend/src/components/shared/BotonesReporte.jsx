import { useState } from 'react';
import api from '../../api/axios';

export default function BotonesReporte({
  tipoDelito = '',
  estado = '',
  desde = '',
  hasta = ''
}) {
  const [descargando, setDescargando] = useState('');

  const descargar = async (tipo) => {
    setDescargando(tipo);
    try {
      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (tipoDelito) params.append('tipoDelito', tipoDelito);
      if (estado)     params.append('estado', estado);
      if (desde)      params.append('desde', desde);
      if (hasta)      params.append('hasta', hasta);

      const url = tipo === 'incidentes'
        ? `/reportes/incidentes.xlsx?${params}`
        : `/reportes/vehiculos.xlsx`;

      // Descargar como blob
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = tipo === 'incidentes'
        ? `incidentes_${new Date().toISOString().slice(0,10)}.xlsx`
        : `vehiculos_${new Date().toISOString().slice(0,10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Error al descargar:', err);
      alert('Error al generar el reporte');
    } finally {
      setDescargando('');
    }
  };

  return (
    <div style={s.contenedor}>
      <button
        style={{
          ...s.btn,
          opacity: descargando === 'incidentes' ? 0.7 : 1
        }}
        disabled={!!descargando}
        onClick={() => descargar('incidentes')}
      >
        {descargando === 'incidentes'
          ? '⏳ Generando...'
          : '📥 Exportar Incidentes Excel'
        }
      </button>

      <button
        style={{
          ...s.btn,
          ...s.btnVerde,
          opacity: descargando === 'vehiculos' ? 0.7 : 1
        }}
        disabled={!!descargando}
        onClick={() => descargar('vehiculos')}
      >
        {descargando === 'vehiculos'
          ? '⏳ Generando...'
          : '📥 Exportar Vehículos Excel'
        }
      </button>
    </div>
  );
}

const s = {
  contenedor: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  btn: {
    padding: '10px 18px',
    background: '#1565c0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.2s'
  },
  btnVerde: {
    background: '#2e7d32'
  }
};