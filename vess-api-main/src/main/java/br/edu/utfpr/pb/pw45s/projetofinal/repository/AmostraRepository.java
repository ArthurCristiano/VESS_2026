package br.edu.utfpr.pb.pw45s.projetofinal.repository;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AmostraRepository extends CrudRepository<Long, Amostra> {


    @Query("SELECT a FROM Amostra a " +
            "JOIN FETCH a.avaliacao av " +
            "LEFT JOIN FETCH av.regiao " +
            "WHERE a.id = (" +
            "SELECT MIN(a2.id) FROM Amostra a2 WHERE a2.avaliacao = a.avaliacao AND a2.localizacao LIKE '%,%'" +
            ") " +
            "AND av.status = br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus.ATIVO")
    List<Amostra> findFirstActiveSampleOfEachAvaliacaoWithLocation();
}
