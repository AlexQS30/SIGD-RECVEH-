package com.sigd.recveh.dto.response;

import com.sigd.recveh.enums.EstadoVehiculo;
import java.time.OffsetDateTime;
import java.util.UUID;

public record VehiculoResponse(
    UUID id,
    String placa,
    String marca,
    String modelo,
    Integer anio,
    String color,
    String tipoVehiculo,
    EstadoVehiculo estado,
    String estadoDescripcion,
    String numSerie,
    String propietarioNombre,
    String propietarioDni,
    OffsetDateTime createdAt
) {}