package com.sigd.recveh.dto.response;

import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record IncidenteResponse(
    UUID id,
    String numeroCaso,
    TipoDelito tipoDelito,
    String tipoDelitoDescripcion,
    EstadoIncidente estado,
    String estadoDescripcion,
    LocalDate fechaHecho,
    LocalTime horaHecho,
    String descripcion,
    String numDenunciaSirdic,
    String distrito,
    String usuarioResponsable,
    List<VehiculoResponse> vehiculos,
    List<UbicacionResponse> ubicaciones,
    OffsetDateTime createdAt
) {}