package com.sigd.recveh.controller;

import com.sigd.recveh.dto.request.IncidenteRequest;
import com.sigd.recveh.dto.response.IncidenteResponse;
import com.sigd.recveh.dto.response.PageResponse;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import com.sigd.recveh.service.IncidenteService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/incidentes")
public class IncidenteController {

    private final IncidenteService incidenteService;

    public IncidenteController(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    // POST /api/incidentes
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<IncidenteResponse> registrar(
            @Valid @RequestBody IncidenteRequest request) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(incidenteService.registrar(request));
    }

    // GET /api/incidentes/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<IncidenteResponse> obtenerPorId(
            @PathVariable UUID id) {
        return ResponseEntity.ok(incidenteService.obtenerPorId(id));
    }

    // GET /api/incidentes
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<PageResponse<IncidenteResponse>> listar(
            @RequestParam(required = false) TipoDelito tipoDelito,
            @RequestParam(required = false) EstadoIncidente estado,
            @RequestParam(required = false) UUID distritoId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "10") int tamanio) {
        return ResponseEntity.ok(
            incidenteService.listar(
                tipoDelito, estado, distritoId,
                desde, hasta, pagina, tamanio));
    }

    // PATCH /api/incidentes/{id}/estado
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<IncidenteResponse> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam EstadoIncidente estado) {
        return ResponseEntity.ok(
            incidenteService.cambiarEstado(id, estado));
    }
}