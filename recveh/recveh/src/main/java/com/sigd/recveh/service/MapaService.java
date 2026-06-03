package com.sigd.recveh.service;

import com.sigd.recveh.dto.response.GeoJsonCollectionDto;
import com.sigd.recveh.dto.response.GeoJsonFeatureDto;
import com.sigd.recveh.dto.response.GeoJsonPointDto;
import com.sigd.recveh.entity.Incidente;
import com.sigd.recveh.entity.UbicacionHecho;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import com.sigd.recveh.enums.TipoUbicacion;
import com.sigd.recveh.repository.IncidenteRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MapaService {

    private final IncidenteRepository incidenteRepository;

    public MapaService(IncidenteRepository incidenteRepository) {
        this.incidenteRepository = incidenteRepository;
    }

    // ── GeoJSON de todos los incidentes (con filtros opcionales) ─
    @Transactional(readOnly = true)
    public GeoJsonCollectionDto obtenerGeoJson(
            TipoDelito tipoDelito,
            EstadoIncidente estado,
            LocalDate desde,
            LocalDate hasta) {

        List<Incidente> incidentes;

        if (tipoDelito != null) {
            incidentes = incidenteRepository
                .findByTipoDelitoOrderByCreatedAtDesc(
                    tipoDelito,
                    PageRequest.of(0, 2000))
                .getContent();
        } else if (estado != null) {
            incidentes = incidenteRepository
                .findByEstadoOrderByCreatedAtDesc(
                    estado,
                    PageRequest.of(0, 2000))
                .getContent();
        } else if (desde != null && hasta != null) {
            incidentes = incidenteRepository
                .findByFechaHechoBetween(
                    desde, hasta,
                    PageRequest.of(0, 2000))
                .getContent();
        } else {
            incidentes = incidenteRepository
                .findAllByOrderByCreatedAtDesc(
                    PageRequest.of(0, 2000))
                .getContent();
        }

        List<GeoJsonFeatureDto> features = new ArrayList<>();

        for (Incidente incidente : incidentes) {
            for (UbicacionHecho ubicacion : incidente.getUbicaciones()) {

                if (ubicacion.getPunto() == null) continue;

                // Propiedades que verá el usuario al hacer clic en el mapa
                Map<String, Object> props = new HashMap<>();
                props.put("id",               incidente.getId().toString());
                props.put("numeroCaso",        incidente.getNumeroCaso());
                props.put("tipoDelito",        incidente.getTipoDelito().name());
                props.put("tipoDelitoLabel",   incidente.getTipoDelito().getDescripcion());
                props.put("estado",            incidente.getEstado().name());
                props.put("estadoLabel",       incidente.getEstado().getDescripcion());
                props.put("fechaHecho",        incidente.getFechaHecho().toString());
                props.put("descripcion",       incidente.getDescripcion());
                props.put("sirdic",            incidente.getNumDenunciaSirdic());
                props.put("tipoUbicacion",     ubicacion.getTipoUbicacion().name());
                props.put("direccion",         ubicacion.getDireccionReferencia());
                props.put("distrito",          incidente.getDistrito() != null
                    ? incidente.getDistrito().getNombre() : null);

                // Vehículos involucrados
                List<String> placas = incidente.getIncidenteVehiculos()
                    .stream()
                    .map(iv -> iv.getVehiculo().getPlaca())
                    .toList();
                props.put("placas", placas);

                // Coordenadas: longitud primero, luego latitud (estándar GeoJSON)
                GeoJsonPointDto punto = new GeoJsonPointDto(
                    ubicacion.getPunto().getX(), // longitud
                    ubicacion.getPunto().getY()  // latitud
                );

                features.add(new GeoJsonFeatureDto(punto, props));
            }
        }

        return new GeoJsonCollectionDto(features);
    }

    // ── Datos para el mapa de calor (heatmap) ───────────────────
    @Transactional(readOnly = true)
    public List<List<Double>> obtenerHeatmapData(
            TipoDelito tipoDelito,
            LocalDate desde,
            LocalDate hasta) {

        List<Incidente> incidentes;

        if (tipoDelito != null) {
            incidentes = incidenteRepository
                .findByTipoDelitoOrderByCreatedAtDesc(
                    tipoDelito, PageRequest.of(0, 5000))
                .getContent();
        } else if (desde != null && hasta != null) {
            incidentes = incidenteRepository
                .findByFechaHechoBetween(
                    desde, hasta, PageRequest.of(0, 5000))
                .getContent();
        } else {
            incidentes = incidenteRepository
                .findAllByOrderByCreatedAtDesc(
                    PageRequest.of(0, 5000))
                .getContent();
        }

        // Formato para Leaflet.heat: [[lat, lng, intensidad], ...]
        List<List<Double>> puntos = new ArrayList<>();

        for (Incidente incidente : incidentes) {
            incidente.getUbicaciones().stream()
                .filter(u -> u.getTipoUbicacion() == TipoUbicacion.OCURRENCIA)
                .filter(u -> u.getPunto() != null)
                .forEach(u -> puntos.add(List.of(
                    u.getPunto().getY(),  // latitud
                    u.getPunto().getX(),  // longitud
                    1.0                   // intensidad
                )));
        }

        return puntos;
    }
}