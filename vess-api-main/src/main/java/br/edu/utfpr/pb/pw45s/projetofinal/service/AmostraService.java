package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AmostraRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmostraService extends CrudService<Long, Amostra, AmostraRepository> {

    public List<Amostra> findFirstActiveSampleOfEachAvaliacao() {
        return repository.findFirstActiveSampleOfEachAvaliacaoWithLocation();
    }
}
