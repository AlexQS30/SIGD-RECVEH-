package com.sigd.recveh.repository;

import com.sigd.recveh.entity.Vehiculo;
import com.sigd.recveh.enums.EstadoVehiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, UUID> {

    Optional<Vehiculo> findByPlacaIgnoreCase(String placa);

    boolean existsByPlacaIgnoreCase(String placa);

    @Query("""
        SELECT v FROM Vehiculo v
        WHERE UPPER(v.placa) LIKE UPPER(CONCAT('%', :placa, '%'))
        ORDER BY v.placa ASC
        """)
    Page<Vehiculo> findByPlacaContaining(
        @Param("placa") String placa,
        Pageable pageable);

    // Sin filtro de marca en JPQL — se filtra en el service
    @Query("""
        SELECT v FROM Vehiculo v
        ORDER BY v.createdAt DESC
        """)
    Page<Vehiculo> findAllOrderByCreatedAtDesc(Pageable pageable);

    // Con filtro de marca
    @Query("""
        SELECT v FROM Vehiculo v
        WHERE UPPER(v.marca) LIKE UPPER(CONCAT('%', :marca, '%'))
        ORDER BY v.createdAt DESC
        """)
    Page<Vehiculo> findByMarcaContaining(
        @Param("marca") String marca,
        Pageable pageable);

    Page<Vehiculo> findByEstadoOrderByCreatedAtDesc(
        EstadoVehiculo estado,
        Pageable pageable);

    @Query("""
        SELECT v FROM Vehiculo v
        WHERE v.estado = :estado
        AND UPPER(v.marca) LIKE UPPER(CONCAT('%', :marca, '%'))
        ORDER BY v.createdAt DESC
        """)
    Page<Vehiculo> findByEstadoAndMarca(
        @Param("estado") EstadoVehiculo estado,
        @Param("marca") String marca,
        Pageable pageable);

    long countByEstado(EstadoVehiculo estado);
}