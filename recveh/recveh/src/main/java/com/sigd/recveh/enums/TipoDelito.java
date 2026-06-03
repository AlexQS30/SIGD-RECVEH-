package com.sigd.recveh.enums;

public enum TipoDelito {
    ROBO("Robo de Vehículo"),
    HURTO("Hurto de Vehículo"),
    RECUPERACION("Recuperación de Vehículo"),
    HALLAZGO("Hallazgo de Vehículo");

    private final String descripcion;
    TipoDelito(String descripcion) { this.descripcion = descripcion; }
    public String getDescripcion() { return descripcion; }
}