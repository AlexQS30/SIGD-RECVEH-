package com.sigd.recveh.dto.request;

import com.sigd.recveh.enums.TipoUbicacion;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UbicacionRequest(

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0", message = "Latitud inválida")
    @DecimalMax(value = "90.0",  message = "Latitud inválida")
    Double latitud,

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0", message = "Longitud inválida")
    @DecimalMax(value = "180.0",  message = "Longitud inválida")
    Double longitud,

    String direccionReferencia,

    TipoUbicacion tipoUbicacion
) {}