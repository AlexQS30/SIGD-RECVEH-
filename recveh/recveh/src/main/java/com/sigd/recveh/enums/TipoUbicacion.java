package com.sigd.recveh.enums;

public enum TipoUbicacion {
    OCURRENCIA("Lugar de Ocurrencia"),
    RECUPERACION("Lugar de Recuperación"),
    ABANDONO("Lugar de Abandono"),
    INVESTIGACION("Lugar de Investigación");

    private final String descripcion;
    TipoUbicacion(String descripcion) { this.descripcion = descripcion; }
    public String getDescripcion() { return descripcion; }
}