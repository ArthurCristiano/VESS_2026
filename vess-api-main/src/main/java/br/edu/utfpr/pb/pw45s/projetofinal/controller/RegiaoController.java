package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.RegiaoDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Regiao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.RegiaoRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.RegiaoService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("regioes")
public class RegiaoController extends CrudController<Long, Regiao, RegiaoDTO, RegiaoRepository, RegiaoService> {

    public RegiaoController() {
        super(Regiao.class, RegiaoDTO.class);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<RegiaoDTO>> findAtivas() {
        List<RegiaoDTO> dtos = service.findAtivas().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/ativas/tipo/{tipo}")
    public ResponseEntity<List<RegiaoDTO>> findAtivasPorTipo(@PathVariable RegiaoTipo tipo) {
        List<RegiaoDTO> dtos = service.findAtivasPorTipo(tipo).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<RegiaoDTO> inativar(@PathVariable Long id) {
        try {
            Regiao regiao = service.inativar(id);
            return ResponseEntity.ok(toDto(regiao));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<RegiaoDTO> reativar(@PathVariable Long id) {
        try {
            Regiao regiao = service.reativar(id);
            return ResponseEntity.ok(toDto(regiao));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}