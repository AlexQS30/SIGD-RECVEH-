package com.sigd.recveh.controller;

import com.sigd.recveh.dto.request.VehiculoRequest;
import com.sigd.recveh.dto.response.PageResponse;
import com.sigd.recveh.dto.response.VehiculoResponse;
import com.sigd.recveh.enums.EstadoVehiculo;
import com.sigd.recveh.service.VehiculoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/vehiculos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    // POST /api/vehiculos
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<VehiculoResponse> crear(
            @Valid @RequestBody VehiculoRequest request) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(vehiculoService.crear(request));
    }

    // GET /api/vehiculos/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<VehiculoResponse> obtenerPorId(
            @PathVariable UUID id) {
        return ResponseEntity.ok(vehiculoService.obtenerPorId(id));
    }

    // GET /api/vehiculos/placa/{placa}
    @GetMapping("/placa/{placa}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<VehiculoResponse> buscarPorPlaca(
            @PathVariable String placa) {
        return ResponseEntity.ok(vehiculoService.buscarPorPlaca(placa));
    }

    // GET /api/vehiculos?estado=ROBADO&marca=toyota&pagina=0&tamanio=10
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR','ANALISTA','CONSULTOR')")
    public ResponseEntity<PageResponse<VehiculoResponse>> listar(
            @RequestParam(required = false) EstadoVehiculo estado,
            @RequestParam(required = false) String marca,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanio) {
        return ResponseEntity.ok(
            vehiculoService.listar(estado, marca, pagina, tamanio));
    }

    // PUT /api/vehiculos/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<VehiculoResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody VehiculoRequest request) {
        return ResponseEntity.ok(vehiculoService.actualizar(id, request));
    }

    // PATCH /api/vehiculos/{id}/estado
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public ResponseEntity<VehiculoResponse> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam EstadoVehiculo estado) {
        return ResponseEntity.ok(
            vehiculoService.cambiarEstado(id, estado));
    }

    // DELETE /api/vehiculos/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        vehiculoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}