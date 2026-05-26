package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AmostraMapaDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Amostra;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AmostraRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.AmostraService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("amostra")
public class AmostraController extends CrudController<Long, Amostra, AmostraDTO, AmostraRepository, AmostraService> {


    private final AmostraService amostraService;

    public AmostraController(AmostraService amostraService) {
        super(Amostra.class, AmostraDTO.class);
        this.amostraService = amostraService;
    }
    @GetMapping("/resumo-mapa")
    public List<AmostraMapaDTO> getResumoParaMapa() {
        return amostraService.findFirstActiveSampleOfEachAvaliacao()
                .stream()
                .map(AmostraMapaDTO::from)
                .collect(Collectors.toList());
    }
}
