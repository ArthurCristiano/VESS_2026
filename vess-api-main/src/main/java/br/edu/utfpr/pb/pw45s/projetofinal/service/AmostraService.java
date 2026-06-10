package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AmostraRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmostraService extends CrudService<Long, Amostra, AmostraRepository> {

    private final AmostraRepository amostraRepository;

    public AmostraService(AmostraRepository amostraRepository) {
        this.amostraRepository = amostraRepository;
    }

    public List<Amostra> findFirstActiveSampleWithFilter(Long regiaoId, Pageable pageable) {
        return amostraRepository.findFirstActiveSampleOfEachAvaliacaoWithFilter(regiaoId, pageable);
    }

    public List<Amostra> findAvaliacoesInBoundingBox(Long regiaoId, Double minLat, Double maxLat, Double minLon, Double maxLon, Pageable pageable) {
        return amostraRepository.findAvaliacoesInBoundingBox(regiaoId, minLat, maxLat, minLon, maxLon, pageable);
    }
}
