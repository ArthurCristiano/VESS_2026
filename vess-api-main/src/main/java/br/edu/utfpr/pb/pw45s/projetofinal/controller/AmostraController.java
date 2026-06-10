package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraMapaDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AmostraRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.AmostraService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("amostra")
public class AmostraController extends CrudController<Long, Amostra, AmostraDTO, AmostraRepository, AmostraService> {


    private final AmostraRepository amostraRepository;

    public AmostraController(AmostraService amostraService, AmostraRepository amostraRepository) {
        super(Amostra.class, AmostraDTO.class);
        this.amostraRepository = amostraRepository;
    }
    @GetMapping("/resumo-mapa")
    public List<AmostraMapaDTO> getResumoParaMapa(
            @RequestParam(value = "regiaoId", required = false) Long regiaoId,
            @RequestParam(value = "minLat", required = false) Double minLat,
            @RequestParam(value = "maxLat", required = false) Double maxLat,
            @RequestParam(value = "minLon", required = false) Double minLon,
            @RequestParam(value = "maxLon", required = false) Double maxLon,
            @RequestParam(value = "limit", defaultValue = "100") Integer limit) {

        Pageable limitConfig = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));
        List<Amostra> resultado;

        if (minLat != null && maxLat != null && minLon != null && maxLon != null) {
            resultado = amostraRepository.findAvaliacoesInBoundingBox(regiaoId, minLat, maxLat, minLon, maxLon, limitConfig);
        } else {
            resultado = amostraRepository.findFirstActiveSampleOfEachAvaliacaoWithFilter(regiaoId, limitConfig);
        }

        return resultado.stream()
                .map(AmostraMapaDTO::from)
                .collect(Collectors.toList());
    }
}
