package com.sigd.recveh.dto.request;

import com.sigd.recveh.enums.EstadoVehiculo;
import jakarta.validation.constraints.*;

public record VehiculoRequest(

    @NotBlank(message = "La placa es obligatoria")
    @Size(min = 6, max = 20, message = "La placa debe tener entre 6 y 20 caracteres")
    String placa,

    @NotBlank(message = "La marca es obligatoria")
    String marca,

    @NotBlank(message = "El modelo es obligatorio")
    String modelo,

    @Min(value = 1900, message = "El año no puede ser menor a 1900")
    @Max(value = 2100, message = "El año no es válido")
    Integer anio,

    String color,

    String tipoVehiculoId,

    EstadoVehiculo estado,

    String numSerie,

    String propietarioNombre,

    @Size(max = 20, message = "El DNI no puede superar 20 caracteres")
    String propietarioDni
) {}