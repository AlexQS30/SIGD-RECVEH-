package com.sigd.recveh.service;

import com.sigd.recveh.dto.response.DashboardResponse;
import com.sigd.recveh.enums.EstadoIncidente;
import com.sigd.recveh.enums.EstadoVehiculo;
import com.sigd.recveh.enums.TipoDelito;
import com.sigd.recveh.repository.IncidenteRepository;
import com.sigd.recveh.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final IncidenteRepository incidenteRepository;
    private final VehiculoRepository  vehiculoRepository;

    public DashboardService(IncidenteRepository incidenteRepository,
                            VehiculoRepository vehiculoRepository) {
        this.incidenteRepository = incidenteRepository;
        this.vehiculoRepository  = vehiculoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse obtenerEstadisticas() {

        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);

        return new DashboardResponse(
            incidenteRepository.count(),
            incidenteRepository.countByTipoDelito(TipoDelito.ROBO),
            incidenteRepository.countByTipoDelito(TipoDelito.HURTO),
            incidenteRepository.countByTipoDelito(TipoDelito.RECUPERACION),
            incidenteRepository.countByEstado(EstadoIncidente.ABIERTO),
            incidenteRepository.countByEstado(EstadoIncidente.EN_INVESTIGACION),
            incidenteRepository.countByEstado(EstadoIncidente.CERRADO),
            vehiculoRepository.countByEstado(EstadoVehiculo.ROBADO),
            vehiculoRepository.countByEstado(EstadoVehiculo.HURTADO),
            vehiculoRepository.countByEstado(EstadoVehiculo.RECUPERADO),
            incidenteRepository.countByFechaHechoAfter(inicioMes)
        );
    }
}