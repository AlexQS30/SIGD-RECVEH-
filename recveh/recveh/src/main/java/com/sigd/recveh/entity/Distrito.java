package com.sigd.recveh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.MultiPolygon;
import java.util.UUID;

@Entity
@Table(name = "distrito")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Distrito {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20, unique = true)
    private String codigo;

    @Column(length = 100)
    private String provincia;

    @Column(length = 100)
    private String departamento;

    // Tipo geométrico PostGIS — requiere hibernate-spatial
    @Column(columnDefinition = "geometry(MultiPolygon, 4326)")
    private MultiPolygon poligono;
}