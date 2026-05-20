package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Avaliacao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvaliacaoResponseDTO {

    private Long id;
    private String nomeAvaliacao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private LocalDateTime dataCriacao;
    private String resumoAvaliacao;
    private String descricaoManejoLocal;
    private Integer totalAmostras;
    private Float escoreMedioGeral;
    private String avaliador;
    private String informacoes;
    private AvaliacaoStatus status;
    private RegiaoResumoDTO regiao;

    public static AvaliacaoResponseDTO from(Avaliacao avaliacao) {
        AvaliacaoResponseDTO dto = new AvaliacaoResponseDTO();
        dto.setId(avaliacao.getId());
        dto.setNomeAvaliacao(avaliacao.getNomeAvaliacao());
        dto.setDataInicio(avaliacao.getDataInicio());
        dto.setDataFim(avaliacao.getDataFim());
        dto.setDataCriacao(avaliacao.getDataCriacao());
        dto.setResumoAvaliacao(avaliacao.getResumoAvaliacao());
        dto.setDescricaoManejoLocal(avaliacao.getDescricaoManejoLocal());
        dto.setTotalAmostras(avaliacao.getTotalAmostras());
        dto.setEscoreMedioGeral(avaliacao.getEscoreMedioGeral());
        dto.setAvaliador(avaliacao.getAvaliador());
        dto.setInformacoes(avaliacao.getInformacoes());
        dto.setStatus(avaliacao.getStatus());
        dto.setRegiao(RegiaoResumoDTO.from(avaliacao.getRegiao()));
        return dto;
    }
}
