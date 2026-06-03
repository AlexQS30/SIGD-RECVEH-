package com.sigd.recveh.dto.response;

import java.util.Map;

public record GeoJsonFeatureDto(
    String type,
    GeoJsonPointDto geometry,
    Map<String, Object> properties
) {
    public GeoJsonFeatureDto(GeoJsonPointDto geometry,
                              Map<String, Object> properties) {
        this("Feature", geometry, properties);
    }
}