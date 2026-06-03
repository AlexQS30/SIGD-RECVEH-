package com.sigd.recveh.entity;

import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.TipoDelito;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incidente")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incidente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "numero_caso", nullable = false, unique = true, length = 30)
    private String numeroCaso;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_delito", nullable = false, length = 20)
    private TipoDelito tipoDelito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoIncidente estado = EstadoIncidente.ABIERTO;

    @Column(name = "fecha_hecho", nullable = false)
    private LocalDate fechaHecho;

    @Column(name = "hora_hecho")
    private LocalTime horaHecho;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "num_denuncia_sirdic", length = 50)
    private String numDenunciaSirdic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distrito_id")
    private Distrito distrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsable_id")
    private Usuario usuarioResponsable;

    @OneToMany(mappedBy = "incidente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UbicacionHecho> ubicaciones = new ArrayList<>();

    @OneToMany(mappedBy = "incidente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Diligencia> diligencias = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}