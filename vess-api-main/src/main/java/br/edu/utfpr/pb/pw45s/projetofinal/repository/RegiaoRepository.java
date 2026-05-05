package br.edu.utfpr.pb.pw45s.projetofinal.repository;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Regiao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudRepository;

import java.util.List;

public interface RegiaoRepository extends CrudRepository<Long, Regiao> {
    List<Regiao> findByAtivaTrue();
    List<Regiao> findByTipoAndAtivaTrue(RegiaoTipo tipo);
}