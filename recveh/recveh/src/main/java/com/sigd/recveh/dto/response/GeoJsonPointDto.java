package com.sigd.recveh.dto.response;

import java.util.List;

public record GeoJsonPointDto(
    String type,
    List<Double> coordinates
) {
    // Constructor conveniente
    public GeoJsonPointDto(double longitud, double latitud) {
        this("Point", List.of(longitud, latitud));
    }
}