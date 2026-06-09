package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class AmostraDTO implements Serializable {
    private Long id;
    private String nomeAmostra;
    private Integer numeroCamadas;
    private String arquivoUpload;
    private String imagemUrl;
    private Float escoreQeVess;
    private String descricaoManejo;
    private String notaAmostra;
    private String dataAvaliacao;
    private Integer ordemAmostra;
    private String localizacao;
    private List<CamadaDTO> camadas;
}