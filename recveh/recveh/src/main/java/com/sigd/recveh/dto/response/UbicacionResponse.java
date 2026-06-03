package com.sigd.recveh.dto.response;

import com.sigd.recveh.enums.TipoUbicacion;
import java.util.UUID;

public record UbicacionResponse(
    UUID id,
    Double latitud,
    Double longitud,
    String direccionReferencia,
    TipoUbicacion tipoUbicacion
) {}