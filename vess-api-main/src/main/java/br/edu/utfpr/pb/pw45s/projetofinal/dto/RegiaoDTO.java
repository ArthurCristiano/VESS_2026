package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

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

    private boolean ativa;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}