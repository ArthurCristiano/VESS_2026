package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Regiao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegiaoResumoDTO {

    private Long id;
    private String nome;
    private RegiaoTipo tipo;
    private String corHex;

    public static RegiaoResumoDTO from(Regiao regiao) {
        if (regiao == null) {
            return null;
        }
        return new RegiaoResumoDTO(
                regiao.getId(),
                regiao.getNome(),
                regiao.getTipo(),
                regiao.getCorHex()
        );
    }
}
