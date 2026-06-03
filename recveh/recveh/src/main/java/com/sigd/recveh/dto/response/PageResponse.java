package com.sigd.recveh.dto.response;

import java.util.List;

public record PageResponse<T>(
    List<T> contenido,
    int paginaActual,
    int totalPaginas,
    long totalElementos,
    boolean esUltima
) {}