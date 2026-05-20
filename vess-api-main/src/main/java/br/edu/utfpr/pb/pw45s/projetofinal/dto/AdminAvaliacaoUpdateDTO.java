package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminAvaliacaoUpdateDTO {

    @Size(max = 255, message = "O nome da avaliação deve ter no máximo 255 caracteres.")
    private String nomeAvaliacao;

    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;

    @Size(max = 2000, message = "O resumo deve ter no máximo 2000 caracteres.")
    private String resumoAvaliacao;

    @Size(max = 2000, message = "A descrição de manejo local deve ter no máximo 2000 caracteres.")
    private String descricaoManejoLocal;

    @Size(max = 255, message = "O avaliador deve ter no máximo 255 caracteres.")
    private String avaliador;

    @Size(max = 2000, message = "As informações devem ter no máximo 2000 caracteres.")
    private String informacoes;

    /** Quando informado, vincula ou altera a região. Null = mantém o vínculo atual. */
    private Long regiaoId;
}
