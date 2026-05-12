package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegiaoPontoDTO {

    private Long id;

    @NotNull(message = "A ordem do ponto é obrigatória.")
    @Min(value = 1,  message = "A ordem mínima é 1.")
    @Max(value = 10, message = "A ordem máxima é 10.")
    private Integer ordem;

    @NotNull(message = "A latitude é obrigatória.")
    @DecimalMin(value = "-90.0",  message = "Latitude mínima é -90.")
    @DecimalMax(value = "90.0",   message = "Latitude máxima é 90.")
    private Double latitude;

    @NotNull(message = "A longitude é obrigatória.")
    @DecimalMin(value = "-180.0", message = "Longitude mínima é -180.")
    @DecimalMax(value = "180.0",  message = "Longitude máxima é 180.")
    private Double longitude;
}