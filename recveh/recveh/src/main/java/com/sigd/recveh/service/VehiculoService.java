package com.sigd.recveh.service;

import com.sigd.recveh.dto.request.VehiculoRequest;
import com.sigd.recveh.dto.response.PageResponse;
import com.sigd.recveh.dto.response.VehiculoResponse;
import com.sigd.recveh.entity.TipoVehiculo;
import com.sigd.recveh.entity.Vehiculo;
import com.sigd.recveh.enums.EstadoVehiculo;
import com.sigd.recveh.repository.TipoVehiculoRepository;
import com.sigd.recveh.repository.VehiculoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository,
                           TipoVehiculoRepository tipoVehiculoRepository) {
        this.vehiculoRepository     = vehiculoRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }

    // ── Crear vehículo ───────────────────────────────────────────
    @Transactional
    public VehiculoResponse crear(VehiculoRequest request) {

        if (vehiculoRepository.existsByPlacaIgnoreCase(request.placa())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ya existe un vehículo con la placa: " + request.placa()
            );
        }

        Vehiculo vehiculo = Vehiculo.builder()
            .placa(request.placa().toUpperCase().trim())
            .marca(request.marca())
            .modelo(request.modelo())
            .anio(request.anio() != null
                ? request.anio().shortValue() : null)
            .color(request.color())
            .estado(request.estado() != null
                ? request.estado() : EstadoVehiculo.ACTIVO)
            .numSerie(request.numSerie())
            .propietarioNombre(request.propietarioNombre())
            .propietarioDni(request.propietarioDni())
            .build();

        if (request.tipoVehiculoId() != null) {
            TipoVehiculo tipo = tipoVehiculoRepository
                .findById(UUID.fromString(request.tipoVehiculoId()))
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de vehículo no encontrado"));
            vehiculo.setTipoVehiculo(tipo);
        }

        return toResponse(vehiculoRepository.save(vehiculo));
    }

    // ── Obtener por ID ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public VehiculoResponse obtenerPorId(UUID id) {
        return toResponse(buscarPorId(id));
    }

    // ── Buscar por placa exacta ──────────────────────────────────
    @Transactional(readOnly = true)
    public VehiculoResponse buscarPorPlaca(String placa) {
        return vehiculoRepository
            .findByPlacaIgnoreCase(placa.trim())
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No se encontró vehículo con placa: " + placa));
    }

    // ── Listar con filtros y paginación ──────────────────────────
    @Transactional(readOnly = true)
public PageResponse<VehiculoResponse> listar(
        EstadoVehiculo estado, String marca,
        int pagina, int tamanio) {

    Pageable pageable = PageRequest.of(pagina, tamanio);
    Page<Vehiculo> page;

    boolean tieneEstado = estado != null;
    boolean tieneMarca  = marca != null && !marca.isBlank();

    if (tieneEstado && tieneMarca) {
        page = vehiculoRepository.findByEstadoAndMarca(
            estado, marca, pageable);
    } else if (tieneEstado) {
        page = vehiculoRepository.findByEstadoOrderByCreatedAtDesc(
            estado, pageable);
    } else if (tieneMarca) {
        page = vehiculoRepository.findByMarcaContaining(
            marca, pageable);
    } else {
        // Sin filtros — devuelve todos paginado
        page = vehiculoRepository.findAllOrderByCreatedAtDesc(pageable);
    }

    return new PageResponse<>(
        page.getContent().stream().map(this::toResponse).toList(),
        page.getNumber(),
        page.getTotalPages(),
        page.getTotalElements(),
        page.isLast()
    );
}

    // ── Actualizar vehículo ──────────────────────────────────────
    @Transactional
    public VehiculoResponse actualizar(UUID id, VehiculoRequest request) {

        Vehiculo vehiculo = buscarPorId(id);

        if (!vehiculo.getPlaca().equalsIgnoreCase(request.placa()) &&
            vehiculoRepository.existsByPlacaIgnoreCase(request.placa())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ya existe un vehículo con la placa: " + request.placa());
        }

        vehiculo.setPlaca(request.placa().toUpperCase().trim());
        vehiculo.setMarca(request.marca());
        vehiculo.setModelo(request.modelo());
        vehiculo.setAnio(request.anio() != null
            ? request.anio().shortValue() : null);
        vehiculo.setColor(request.color());
        vehiculo.setNumSerie(request.numSerie());
        vehiculo.setPropietarioNombre(request.propietarioNombre());
        vehiculo.setPropietarioDni(request.propietarioDni());

        if (request.estado() != null) {
            vehiculo.setEstado(request.estado());
        }

        if (request.tipoVehiculoId() != null) {
            TipoVehiculo tipo = tipoVehiculoRepository
                .findById(UUID.fromString(request.tipoVehiculoId()))
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de vehículo no encontrado"));
            vehiculo.setTipoVehiculo(tipo);
        }

        return toResponse(vehiculoRepository.save(vehiculo));
    }

    // ── Cambiar estado ───────────────────────────────────────────
    @Transactional
    public VehiculoResponse cambiarEstado(UUID id,
                                          EstadoVehiculo nuevoEstado) {
        Vehiculo vehiculo = buscarPorId(id);
        vehiculo.setEstado(nuevoEstado);
        return toResponse(vehiculoRepository.save(vehiculo));
    }

    // ── Eliminar ─────────────────────────────────────────────────
    @Transactional
    public void eliminar(UUID id) {
        vehiculoRepository.delete(buscarPorId(id));
    }

    // ── Helper privado: buscar o lanzar 404 ─────────────────────
    private Vehiculo buscarPorId(UUID id) {
        return vehiculoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Vehículo no encontrado con id: " + id));
    }

    // ── Mapper: entidad → response ───────────────────────────────
    private VehiculoResponse toResponse(Vehiculo v) {
        return new VehiculoResponse(
            v.getId(),
            v.getPlaca(),
            v.getMarca(),
            v.getModelo(),
            v.getAnio() != null ? v.getAnio().intValue() : null,
            v.getColor(),
            v.getTipoVehiculo() != null
                ? v.getTipoVehiculo().getNombre() : null,
            v.getEstado(),
            v.getEstado().getDescripcion(),
            v.getNumSerie(),
            v.getPropietarioNombre(),
            v.getPropietarioDni(),
            v.getCreatedAt()
        );
    }
}