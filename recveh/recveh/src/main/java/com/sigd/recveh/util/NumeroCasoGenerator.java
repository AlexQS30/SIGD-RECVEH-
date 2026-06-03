package com.sigd.recveh.util;

import com.sigd.recveh.repository.IncidenteRepository;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
public class NumeroCasoGenerator {

    private final IncidenteRepository incidenteRepository;

    public NumeroCasoGenerator(IncidenteRepository incidenteRepository) {
        this.incidenteRepository = incidenteRepository;
    }

    /**
     * Genera número de caso con formato: INC-2025-000001
     */
    public String generar() {
        int anio = Year.now().getValue();
        long total = incidenteRepository.count() + 1;
        return String.format("INC-%d-%06d", anio, total);
    }
}