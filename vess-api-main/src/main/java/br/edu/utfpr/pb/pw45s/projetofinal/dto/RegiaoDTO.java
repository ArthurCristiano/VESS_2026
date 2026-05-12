package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RegiaoDTO {

    private Long id;

    @NotBlank(message = "O nome da região é obrigatório.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    private String nome;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
    private String descricao;

    @NotNull(message = "O tipo da região é obrigatório.")
    private RegiaoTipo tipo;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6})$",
            message = "A cor deve estar no formato hexadecimal (#RRGGBB), ex: #1D9E75."
    )
    private String corHex;

    @Valid
    @Size(min = 3, max = 10, message = "O polígono deve ter entre 3 e 10 pontos.")
    private List<RegiaoPontoDTO> pontos;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private boolean ativa;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime dataCriacao;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime dataAtualizacao;
}