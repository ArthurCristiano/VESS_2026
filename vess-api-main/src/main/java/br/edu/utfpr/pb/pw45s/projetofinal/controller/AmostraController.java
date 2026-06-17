package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraMapaDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AmostraRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.AmostraService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("amostra")
public class AmostraController extends CrudController<Long, Amostra, AmostraDTO, AmostraRepository, AmostraService> {

    private static final int MIN_MAP_LIMIT = 1;
    private static final int MAX_MAP_LIMIT = 10000;

    private final AmostraRepository amostraRepository;

    public AmostraController(AmostraService amostraService, AmostraRepository amostraRepository) {
        super(Amostra.class, AmostraDTO.class);
        this.amostraRepository = amostraRepository;
    }
    @GetMapping("/resumo-mapa")
    public Page<AmostraMapaDTO> getResumoParaMapa(
            @RequestParam(value = "regiaoId", required = false) Long regiaoId,
            @RequestParam(value = "minLat", required = false) Double minLat,
            @RequestParam(value = "maxLat", required = false) Double maxLat,
            @RequestParam(value = "minLon", required = false) Double minLon,
            @RequestParam(value = "maxLon", required = false) Double maxLon,
            @RequestParam(value = "limit", defaultValue = "100") Integer limit,
            @RequestParam(value = "page", defaultValue = "0") Integer page) {

        int safeLimit = Math.max(MIN_MAP_LIMIT, Math.min(limit, MAX_MAP_LIMIT));
        int safePage = Math.max(0, page);
        Pageable limitConfig = PageRequest.of(safePage, safeLimit);
        Page<Amostra> resultado;

        if (minLat != null && maxLat != null && minLon != null && maxLon != null) {
            resultado = amostraRepository.findAvaliacoesInBoundingBox(regiaoId, minLat, maxLat, minLon, maxLon, limitConfig);
        } else {
            resultado = amostraRepository.findFirstActiveSampleOfEachAvaliacaoWithFilter(regiaoId, limitConfig);
        }

        return resultado.map(AmostraMapaDTO::from);
    }
}
