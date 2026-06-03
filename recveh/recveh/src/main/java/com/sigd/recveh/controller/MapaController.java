package com.sigd.recveh.controller;

import com.sigd.recveh.dto.response.GeoJsonCollectionDto;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import com.sigd.recveh.service.MapaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/mapa")
public class MapaController {

    private final MapaService mapaService;

    public MapaController(MapaService mapaService) {
        this.mapaService = mapaService;
    }

    /**
     * GET /api/mapa/geojson
     * Devuelve todos los incidentes en formato GeoJSON para Leaflet
     * Parámetros opcionales: tipoDelito, estado, desde, hasta
     */
    @GetMapping("/geojson")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<GeoJsonCollectionDto> obtenerGeoJson(
            @RequestParam(required = false) TipoDelito tipoDelito,
            @RequestParam(required = false) EstadoIncidente estado,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        return ResponseEntity.ok(
            mapaService.obtenerGeoJson(tipoDelito, estado, desde, hasta));
    }

    /**
     * GET /api/mapa/heatmap
     * Devuelve coordenadas para el mapa de calor
     * Formato: [[lat, lng, intensidad], ...]
     */
    @GetMapping("/heatmap")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<List<List<Double>>> obtenerHeatmap(
            @RequestParam(required = false) TipoDelito tipoDelito,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        return ResponseEntity.ok(
            mapaService.obtenerHeatmapData(tipoDelito, desde, hasta));
    }
}