package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Avaliacao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus;
import lombok.Data;

@Data
public class AvaliacaoMapaResumoDTO {

    private Long id;
    private String nomeAvaliacao;
    private Float escoreMedioGeral;
    private AvaliacaoStatus status;
    private RegiaoResumoDTO regiao;

    public static AvaliacaoMapaResumoDTO from(Avaliacao avaliacao) {
        if (avaliacao == null) {
            return null;
        }

        AvaliacaoMapaResumoDTO dto = new AvaliacaoMapaResumoDTO();
        dto.setId(avaliacao.getId());
        dto.setNomeAvaliacao(avaliacao.getNomeAvaliacao());
        dto.setEscoreMedioGeral(avaliacao.getEscoreMedioGeral());
        dto.setStatus(avaliacao.getStatus());
        dto.setRegiao(RegiaoResumoDTO.from(avaliacao.getRegiao()));
        return dto;
    }
}
