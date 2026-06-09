package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import lombok.Data;

@Data
public class AmostraMapaDTO {

    private Long id;
    private String nomeAmostra;
    private String localizacao;
    private String imagemUrl;
    private AvaliacaoMapaResumoDTO avaliacao;

    public static AmostraMapaDTO from(Amostra amostra) {
        AmostraMapaDTO dto = new AmostraMapaDTO();
        dto.setId(amostra.getId());
        dto.setNomeAmostra(amostra.getNomeAmostra());
        dto.setLocalizacao(amostra.getLocalizacao());
        dto.setImagemUrl(amostra.getImagemUrl());
        dto.setAvaliacao(AvaliacaoMapaResumoDTO.from(amostra.getAvaliacao()));
        return dto;
    }
}
