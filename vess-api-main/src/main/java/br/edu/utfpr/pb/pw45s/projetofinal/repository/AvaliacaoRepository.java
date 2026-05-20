package br.edu.utfpr.pb.pw45s.projetofinal.repository;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Avaliacao;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends CrudRepository<Long, Avaliacao> {

    @Query("SELECT DISTINCT a FROM Avaliacao a LEFT JOIN FETCH a.regiao ORDER BY a.id DESC")
    List<Avaliacao> findAllWithRegiao();

    @Query("SELECT a FROM Avaliacao a LEFT JOIN FETCH a.regiao WHERE a.id = :id")
    Optional<Avaliacao> findByIdWithRegiao(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Avaliacao a LEFT JOIN FETCH a.amostras LEFT JOIN FETCH a.regiao WHERE a.id = :id")
    Optional<Avaliacao> findByIdWithAmostrasAndRegiao(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Avaliacao a LEFT JOIN FETCH a.amostras WHERE a.id = :id")
    Optional<Avaliacao> findByIdWithAmostras(@Param("id") Long id);
}
