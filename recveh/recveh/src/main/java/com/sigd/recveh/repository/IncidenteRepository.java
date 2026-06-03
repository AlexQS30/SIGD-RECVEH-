package com.sigd.recveh.repository;

import com.sigd.recveh.entity.Incidente;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidenteRepository extends JpaRepository<Incidente, UUID> {

    Optional<Incidente> findByNumeroCaso(String numeroCaso);

    boolean existsByNumeroCaso(String numeroCaso);

    // Listado con filtros separados para evitar problema de ENUM con PostgreSQL
    Page<Incidente> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Incidente> findByTipoDelitoOrderByCreatedAtDesc(
        TipoDelito tipoDelito, Pageable pageable);

    Page<Incidente> findByEstadoOrderByCreatedAtDesc(
        EstadoIncidente estado, Pageable pageable);

    Page<Incidente> findByDistrito_IdOrderByCreatedAtDesc(
        UUID distritoId, Pageable pageable);

    @Query("""
        SELECT i FROM Incidente i
        WHERE i.fechaHecho BETWEEN :desde AND :hasta
        ORDER BY i.fechaHecho DESC
        """)
    Page<Incidente> findByFechaHechoBetween(
        @Param("desde") LocalDate desde,
        @Param("hasta") LocalDate hasta,
        Pageable pageable);

    // Conteos para el dashboard
    long countByTipoDelito(TipoDelito tipoDelito);
    long countByEstado(EstadoIncidente estado);

    @Query("""
        SELECT COUNT(i) FROM Incidente i
        WHERE i.fechaHecho >= :desde
        """)
    long countByFechaHechoAfter(@Param("desde") LocalDate desde);
}