package br.edu.utfpr.pb.pw45s.projetofinal.model.converter;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AvaliacaoStatusConverter implements AttributeConverter<AvaliacaoStatus, String> {

    @Override
    public String convertToDatabaseColumn(AvaliacaoStatus status) {
        if (status == null) {
            return AvaliacaoStatus.ATIVO.name();
        }
        return status.name();
    }

    @Override
    public AvaliacaoStatus convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.isBlank()) {
            return AvaliacaoStatus.ATIVO;
        }
        if ("INATIVO".equalsIgnoreCase(dbValue.trim())) {
            return AvaliacaoStatus.INATIVO;
        }
        if ("ATIVO".equalsIgnoreCase(dbValue.trim())) {
            return AvaliacaoStatus.ATIVO;
        }
        // Compatibilidade: valores legados no campo status passam a ser tratados como ATIVO.
        return AvaliacaoStatus.ATIVO;
    }
}
