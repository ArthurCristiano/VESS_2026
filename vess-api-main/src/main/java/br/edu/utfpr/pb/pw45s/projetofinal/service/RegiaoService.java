package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Regiao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.RegiaoRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegiaoService extends CrudService<Long, Regiao, RegiaoRepository> {

    public List<Regiao> findAtivas() {
        return repository.findByAtivaTrue();
    }

    public List<Regiao> findAtivasPorTipo(RegiaoTipo tipo) {
        return repository.findByTipoAndAtivaTrue(tipo);
    }

    @Override
    public Regiao save(Regiao regiao) {
        if (regiao.getId() == null) {
            regiao.setAtiva(true);
        }
        return super.save(regiao);
    }

    @Transactional
    public Regiao inativar(Long id) {
        Regiao regiao = repository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Região não encontrada: " + id));

        if (!regiao.isAtiva()) {
            throw new IllegalStateException("A região já está inativa.");
        }

        regiao.setAtiva(false);
        return repository.save(regiao);
    }

    @Transactional
    public Regiao reativar(Long id) {
        Regiao regiao = repository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Região não encontrada: " + id));

        if (regiao.isAtiva()) {
            throw new IllegalStateException("A região já está ativa.");
        }

        regiao.setAtiva(true);
        return repository.save(regiao);
    }
}