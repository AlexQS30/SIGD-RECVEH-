import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (!puntos || puntos.length === 0) return;

    // Crear la capa de calor
    const heatLayer = L.heatLayer(puntos, {
      radius:    25,    // radio de cada punto en píxeles
      blur:      15,    // suavizado
      maxZoom:   17,
      max:       1.0,
      gradient: {
        0.2: '#00f',   // azul — densidad baja
        0.4: '#0ff',   // cyan
        0.6: '#0f0',   // verde
        0.8: '#ff0',   // amarillo
        1.0: '#f00'    // rojo — densidad alta
      }
    });

    heatLayer.addTo(map);

    // Limpieza al desmontar
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, puntos]);

  return null;
}