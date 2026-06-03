package com.sigd.recveh.service;

import com.sigd.recveh.dto.request.IncidenteRequest;
import com.sigd.recveh.dto.request.UbicacionRequest;
import com.sigd.recveh.dto.response.IncidenteResponse;
import com.sigd.recveh.dto.response.PageResponse;
import com.sigd.recveh.dto.response.UbicacionResponse;
import com.sigd.recveh.entity.*;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import com.sigd.recveh.enums.TipoUbicacion;
import com.sigd.recveh.repository.*;
import com.sigd.recveh.util.NumeroCasoGenerator;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class IncidenteService {

    // SRID 4326 = sistema de coordenadas WGS84 (el de GPS/Google Maps)
    private static final GeometryFactory GEOMETRY_FACTORY =
        new GeometryFactory(new PrecisionModel(), 4326);

    private final IncidenteRepository     incidenteRepository;
    private final VehiculoRepository      vehiculoRepository;
    private final DistritoRepository      distritoRepository;
    private final UsuarioRepository       usuarioRepository;
    private final NumeroCasoGenerator     numeroCasoGenerator;

    public IncidenteService(IncidenteRepository incidenteRepository,
                            VehiculoRepository vehiculoRepository,
                            DistritoRepository distritoRepository,
                            UsuarioRepository usuarioRepository,
                            NumeroCasoGenerator numeroCasoGenerator) {
        this.incidenteRepository  = incidenteRepository;
        this.vehiculoRepository   = vehiculoRepository;
        this.distritoRepository   = distritoRepository;
        this.usuarioRepository    = usuarioRepository;
        this.numeroCasoGenerator  = numeroCasoGenerator;
    }

    // ── Registrar incidente ──────────────────────────────────────
    @Transactional
    public IncidenteResponse registrar(IncidenteRequest request) {

        // 1. Obtener usuario autenticado
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        Usuario usuarioActual = usuarioRepository
            .findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        // 2. Construir el incidente
        Incidente incidente = Incidente.builder()
            .numeroCaso(numeroCasoGenerator.generar())
            .tipoDelito(request.tipoDelito())
            .estado(EstadoIncidente.ABIERTO)
            .fechaHecho(request.fechaHecho())
            .horaHecho(request.horaHecho())
            .descripcion(request.descripcion())
            .numDenunciaSirdic(request.numDenunciaSirdic())
            .usuarioResponsable(usuarioActual)
            .build();

        // 3. Asignar distrito si viene
        if (request.distritoId() != null) {
            Distrito distrito = distritoRepository
                .findById(UUID.fromString(request.distritoId()))
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Distrito no encontrado"));
            incidente.setDistrito(distrito);
        }

        // 4. Guardar el incidente primero (necesitamos el ID)
        Incidente guardado = incidenteRepository.save(incidente);

        // 5. Vincular vehículos
        for (String vehiculoId : request.vehiculoIds()) {
            Vehiculo vehiculo = vehiculoRepository
                .findById(UUID.fromString(vehiculoId))
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vehículo no encontrado: " + vehiculoId));

            IncidenteVehiculo iv = new IncidenteVehiculo();
            iv.setIncidente(guardado);
            iv.setVehiculo(vehiculo);
            iv.setRolVehiculo("PRINCIPAL");
            guardado.getIncidenteVehiculos().add(iv);
        }

        // 6. Agregar ubicación del hecho
        UbicacionHecho ubicacion = crearUbicacion(
            request.ubicacion(),
            TipoUbicacion.OCURRENCIA,
            guardado
        );
        guardado.getUbicaciones().add(ubicacion);

        // 7. Agregar ubicación de recuperación si viene
        if (request.ubicacionRecuperacion() != null) {
            UbicacionHecho ubicacionRec = crearUbicacion(
                request.ubicacionRecuperacion(),
                TipoUbicacion.RECUPERACION,
                guardado
            );
            guardado.getUbicaciones().add(ubicacionRec);
        }

        return toResponse(incidenteRepository.save(guardado));
    }

    // ── Obtener por ID ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public IncidenteResponse obtenerPorId(UUID id) {
        return toResponse(buscarPorId(id));
    }

    // ── Listar con filtros ───────────────────────────────────────
    @Transactional(readOnly = true)
    public PageResponse<IncidenteResponse> listar(
            TipoDelito tipoDelito, EstadoIncidente estado,
            UUID distritoId, LocalDate desde, LocalDate hasta,
            int pagina, int tamanio) {

        Pageable pageable = PageRequest.of(pagina, tamanio);
        Page<Incidente> page;

        if (tipoDelito != null) {
            page = incidenteRepository
                .findByTipoDelitoOrderByCreatedAtDesc(tipoDelito, pageable);
        } else if (estado != null) {
            page = incidenteRepository
                .findByEstadoOrderByCreatedAtDesc(estado, pageable);
        } else if (distritoId != null) {
            page = incidenteRepository
                .findByDistrito_IdOrderByCreatedAtDesc(distritoId, pageable);
        } else if (desde != null && hasta != null) {
            page = incidenteRepository
                .findByFechaHechoBetween(desde, hasta, pageable);
        } else {
            page = incidenteRepository
                .findAllByOrderByCreatedAtDesc(pageable);
        }

        return new PageResponse<>(
            page.getContent().stream().map(this::toResponse).toList(),
            page.getNumber(),
            page.getTotalPages(),
            page.getTotalElements(),
            page.isLast()
        );
    }

    // ── Cambiar estado del incidente ─────────────────────────────
    @Transactional
    public IncidenteResponse cambiarEstado(UUID id,
                                           EstadoIncidente nuevoEstado) {
        Incidente incidente = buscarPorId(id);
        incidente.setEstado(nuevoEstado);
        return toResponse(incidenteRepository.save(incidente));
    }

    // ── Helpers privados ─────────────────────────────────────────
    private Incidente buscarPorId(UUID id) {
        return incidenteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Incidente no encontrado: " + id));
    }

    private UbicacionHecho crearUbicacion(UbicacionRequest req,
                                           TipoUbicacion tipo,
                                           Incidente incidente) {
        // Crear punto geográfico con JTS
        Point punto = GEOMETRY_FACTORY.createPoint(
            new Coordinate(req.longitud(), req.latitud())
        );
        punto.setSRID(4326);

        UbicacionHecho uh = new UbicacionHecho();
        uh.setIncidente(incidente);
        uh.setPunto(punto);
        uh.setDireccionReferencia(req.direccionReferencia());
        uh.setTipoUbicacion(req.tipoUbicacion() != null
            ? req.tipoUbicacion() : tipo);
        return uh;
    }

    private UbicacionResponse toUbicacionResponse(UbicacionHecho u) {
        return new UbicacionResponse(
            u.getId(),
            u.getPunto().getY(),  // Y = latitud
            u.getPunto().getX(),  // X = longitud
            u.getDireccionReferencia(),
            u.getTipoUbicacion()
        );
    }

    private IncidenteResponse toResponse(Incidente i) {
        return new IncidenteResponse(
            i.getId(),
            i.getNumeroCaso(),
            i.getTipoDelito(),
            i.getTipoDelito().getDescripcion(),
            i.getEstado(),
            i.getEstado().getDescripcion(),
            i.getFechaHecho(),
            i.getHoraHecho(),
            i.getDescripcion(),
            i.getNumDenunciaSirdic(),
            i.getDistrito() != null
                ? i.getDistrito().getNombre() : null,
            i.getUsuarioResponsable() != null
                ? i.getUsuarioResponsable().getNombreCompleto() : null,
            i.getIncidenteVehiculos().stream()
                .map(iv -> new com.sigd.recveh.dto.response.VehiculoResponse(
                    iv.getVehiculo().getId(),
                    iv.getVehiculo().getPlaca(),
                    iv.getVehiculo().getMarca(),
                    iv.getVehiculo().getModelo(),
                    iv.getVehiculo().getAnio() != null
                        ? iv.getVehiculo().getAnio().intValue() : null,
                    iv.getVehiculo().getColor(),
                    iv.getVehiculo().getTipoVehiculo() != null
                        ? iv.getVehiculo().getTipoVehiculo().getNombre() : null,
                    iv.getVehiculo().getEstado(),
                    iv.getVehiculo().getEstado().getDescripcion(),
                    iv.getVehiculo().getNumSerie(),
                    iv.getVehiculo().getPropietarioNombre(),
                    iv.getVehiculo().getPropietarioDni(),
                    iv.getVehiculo().getCreatedAt()
                )).toList(),
            i.getUbicaciones().stream()
                .map(this::toUbicacionResponse).toList(),
            i.getCreatedAt()
        );
    }
}