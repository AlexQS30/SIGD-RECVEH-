package com.sigd.recveh.dto.request;

import com.sigd.recveh.enums.TipoDelito;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record IncidenteRequest(

    @NotNull(message = "El tipo de delito es obligatorio")
    TipoDelito tipoDelito,

    @NotNull(message = "La fecha del hecho es obligatoria")
    LocalDate fechaHecho,

    LocalTime horaHecho,

    String descripcion,

    // Número de denuncia del sistema SIRDIC
    String numDenunciaSirdic,

    String distritoId,

    // Vehículos involucrados (al menos uno)
    @NotNull(message = "Debe especificar al menos un vehículo")
    List<String> vehiculoIds,

    // Ubicación del hecho (obligatoria)
    @NotNull(message = "La ubicación es obligatoria")
    @Valid
    UbicacionRequest ubicacion,

    // Ubicación de recuperación (opcional)
    @Valid
    UbicacionRequest ubicacionRecuperacion
) {}