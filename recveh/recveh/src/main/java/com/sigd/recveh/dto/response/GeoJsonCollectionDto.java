package com.sigd.recveh.dto.response;

import java.util.List;

public record GeoJsonCollectionDto(
    String type,
    List<GeoJsonFeatureDto> features
) {
    public GeoJsonCollectionDto(List<GeoJsonFeatureDto> features) {
        this("FeatureCollection", features);
    }
}