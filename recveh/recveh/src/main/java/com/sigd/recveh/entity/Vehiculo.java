package com.sigd.recveh.entity;

import com.sigd.recveh.enums.EstadoVehiculo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehiculo")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Column(nullable = false, length = 80)
    private String marca;

    @Column(nullable = false, length = 80)
    private String modelo;

    @Column(columnDefinition = "SMALLINT")
    private Short anio;

    @Column(length = 50)
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_vehiculo_id")
    private TipoVehiculo tipoVehiculo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)   // ← esto resuelve el problema
    @Column(nullable = false,
            columnDefinition = "estado_vehiculo")
    @Builder.Default
    private EstadoVehiculo estado = EstadoVehiculo.ACTIVO;

    @Column(name = "num_serie", length = 50)
    private String numSerie;

    @Column(name = "propietario_nombre", length = 150)
    private String propietarioNombre;

    @Column(name = "propietario_dni", length = 20)
    private String propietarioDni;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}