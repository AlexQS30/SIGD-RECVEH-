package com.sigd.recveh.service;

import com.sigd.recveh.dto.request.LoginRequest;
import com.sigd.recveh.dto.response.AuthResponse;
import com.sigd.recveh.entity.Usuario;
import com.sigd.recveh.repository.UsuarioRepository;
import com.sigd.recveh.security.JwtService;
import com.sigd.recveh.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthService(UsuarioRepository usuarioRepository,
                       JwtService jwtService,
                       // @Qualifier apunta explícitamente al bean que definimos
                       @Qualifier("authenticationManager")
                       AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService) {
        this.usuarioRepository     = usuarioRepository;
        this.jwtService            = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService    = userDetailsService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.username(),
                request.password()
            )
        );

        Usuario usuario = usuarioRepository
            .findByUsername(request.username())
            .orElseThrow(() ->
                new UsernameNotFoundException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService
            .loadUserByUsername(request.username());

        String token = jwtService.generateToken(
            userDetails,
            Map.of("rol", usuario.getRol().name())
        );

        return new AuthResponse(
            token,
            usuario.getUsername(),
            usuario.getNombreCompleto(),
            usuario.getRol().getDescripcion()
        );
    }
}