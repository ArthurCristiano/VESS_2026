package br.edu.utfpr.pb.pw45s.projetofinal.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Column;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AmostraImageContractTest {

    @Test
    void mapsImageUrlToDatabaseColumn() throws NoSuchFieldException {
        Field imageUrlField = Amostra.class.getDeclaredField("imagemUrl");
        Column column = imageUrlField.getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals("imagem_url", column.name());
        assertEquals(2048, column.length());
    }

    @Test
    void includesImageUrlInCompleteEvaluationResponse() {
        String imageUrl = "https://example.com/images/amostra-1.jpg";
        Avaliacao avaliacao = new Avaliacao();
        Amostra amostra = new Amostra();
        amostra.setImagemUrl(imageUrl);
        amostra.setAvaliacao(avaliacao);
        avaliacao.setAmostras(List.of(amostra));

        JsonNode response = new ObjectMapper().valueToTree(avaliacao);

        assertEquals(imageUrl, response.path("amostras").path(0).path("imagemUrl").asText());
    }
}
