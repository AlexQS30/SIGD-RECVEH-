package com.sigd.recveh.enums;

public enum RolUsuario {

    ADMIN("Administrador"),
    OPERADOR("Operador Policial"),
    ANALISTA("Analista / Supervisor"),
    CONSULTOR("Consultor");

    private final String descripcion;

    RolUsuario(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}