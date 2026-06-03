package com.sigd.recveh.controller;

import com.sigd.recveh.dto.request.LoginRequest;
import com.sigd.recveh.dto.response.AuthResponse;
import com.sigd.recveh.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Body: { "username": "admin", "password": "Admin2025*" }
     * Respuesta: { "token": "eyJ...", "tipo": "Bearer", "username": "admin", ... }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * GET /api/auth/verify
     * Endpoint para que el frontend verifique si el token sigue válido
     * (requiere token en el header Authorization)
     */
    @GetMapping("/verify")
    public ResponseEntity<Void> verify() {
        return ResponseEntity.ok().build();
    }
}