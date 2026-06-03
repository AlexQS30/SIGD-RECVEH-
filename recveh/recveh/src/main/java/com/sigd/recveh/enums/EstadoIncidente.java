package com.sigd.recveh.enums;

public enum EstadoIncidente {
    ABIERTO("Abierto"),
    EN_INVESTIGACION("En Investigación"),
    CERRADO("Cerrado"),
    ARCHIVADO("Archivado");

    private final String descripcion;
    EstadoIncidente(String descripcion) { this.descripcion = descripcion; }
    public String getDescripcion() { return descripcion; }
}