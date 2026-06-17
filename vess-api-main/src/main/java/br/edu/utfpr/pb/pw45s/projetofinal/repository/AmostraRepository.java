package br.edu.utfpr.pb.pw45s.projetofinal.repository;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

public interface AmostraRepository extends CrudRepository<Long, Amostra> {


    @Query(value = "SELECT a FROM Amostra a " +
            "JOIN FETCH a.avaliacao av " +
            "LEFT JOIN FETCH av.regiao " +
            "WHERE a.id = (" +
            "  SELECT MIN(a2.id) FROM Amostra a2 WHERE a2.avaliacao = a.avaliacao AND a2.localizacao LIKE '%,%'" +
            ") " +
            "AND av.status = br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus.ATIVO " +
            "AND (:regiaoId IS NULL OR av.regiao.id = :regiaoId) " +
            "ORDER BY a.id DESC",
            countQuery = "SELECT COUNT(a) FROM Amostra a " +
                    "JOIN a.avaliacao av " +
                    "WHERE a.id = (" +
                    "  SELECT MIN(a2.id) FROM Amostra a2 WHERE a2.avaliacao = a.avaliacao AND a2.localizacao LIKE '%,%'" +
                    ") " +
                    "AND av.status = br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus.ATIVO " +
                    "AND (:regiaoId IS NULL OR av.regiao.id = :regiaoId)")
    Page<Amostra> findFirstActiveSampleOfEachAvaliacaoWithFilter(@Param("regiaoId") Long regiaoId, Pageable pageable);

    @Query(value = "SELECT a.* FROM amostra a " +
            "JOIN avaliacao av ON a.avaliacao_id = av.id " +
            "WHERE av.status = 'ATIVO' " +
            "AND a.id = (SELECT MIN(a2.id) FROM amostra a2 WHERE a2.avaliacao_id = a.avaliacao_id AND a2.localizacao LIKE '%,%') " +
            "AND (:regiaoId IS NULL OR av.regiao_id = :regiaoId) " +
            "AND CAST(split_part(a.localizacao, ',', 1) AS double precision) BETWEEN :minLat AND :maxLat " +
            "AND CAST(split_part(a.localizacao, ',', 2) AS double precision) BETWEEN :minLon AND :maxLon " +
            "ORDER BY a.id DESC",
            countQuery = "SELECT COUNT(*) FROM amostra a " +
                    "JOIN avaliacao av ON a.avaliacao_id = av.id " +
                    "WHERE av.status = 'ATIVO' " +
                    "AND a.id = (SELECT MIN(a2.id) FROM amostra a2 WHERE a2.avaliacao_id = a.avaliacao_id AND a2.localizacao LIKE '%,%') " +
                    "AND (:regiaoId IS NULL OR av.regiao_id = :regiaoId) " +
                    "AND CAST(split_part(a.localizacao, ',', 1) AS double precision) BETWEEN :minLat AND :maxLat " +
                    "AND CAST(split_part(a.localizacao, ',', 2) AS double precision) BETWEEN :minLon AND :maxLon",
            nativeQuery = true)
    Page<Amostra> findAvaliacoesInBoundingBox(
            @Param("regiaoId") Long regiaoId,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon,
            Pageable pageable);

}
