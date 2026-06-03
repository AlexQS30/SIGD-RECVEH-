package com.sigd.recveh.enums;

public enum EstadoVehiculo {
    ACTIVO("Activo"),
    ROBADO("Robado"),
    HURTADO("Hurtado"),
    RECUPERADO("Recuperado"),
    EN_INVESTIGACION("En Investigación");

    private final String descripcion;
    EstadoVehiculo(String descripcion) { this.descripcion = descripcion; }
    public String getDescripcion() { return descripcion; }
}