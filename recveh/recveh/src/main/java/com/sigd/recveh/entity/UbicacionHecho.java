package com.sigd.recveh.entity;

import com.sigd.recveh.enums.TipoUbicacion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ubicacion_hecho")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UbicacionHecho {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidente_id", nullable = false)
    private Incidente incidente;

    // Tipo Point de JTS — se almacena como geometry(Point,4326) en PostGIS
    @Column(columnDefinition = "geometry(Point, 4326)", nullable = false)
    private Point punto;

    @Column(name = "direccion_referencia", length = 300)
    private String direccionReferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ubicacion", nullable = false, length = 20)
    @Builder.Default
    private TipoUbicacion tipoUbicacion = TipoUbicacion.OCURRENCIA;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}