package com.sigd.recveh.dto.response;

public record DashboardResponse(
    long totalIncidentes,
    long totalRobos,
    long totalHurtos,
    long totalRecuperaciones,
    long incidentesAbiertos,
    long incidentesEnInvestigacion,
    long incidentesCerrados,
    long vehiculosRobados,
    long vehiculosHurtados,
    long vehiculosRecuperados,
    long incidentesEsteMes
) {}