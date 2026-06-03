package com.sigd.recveh.dto.response;

public record AuthResponse(
    String token,
    String tipo,
    String username,
    String nombreCompleto,
    String rol
) {
    // Constructor compacto con valor por defecto para tipo
    public AuthResponse(String token, String username,
                        String nombreCompleto, String rol) {
        this(token, "Bearer", username, nombreCompleto, rol);
    }
}