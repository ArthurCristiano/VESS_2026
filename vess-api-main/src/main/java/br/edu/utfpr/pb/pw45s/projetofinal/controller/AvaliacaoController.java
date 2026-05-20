package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AdminAvaliacaoUpdateDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AvaliacaoDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AvaliacaoResponseDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Avaliacao;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AvaliacaoRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.AvaliacaoService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("avaliacao")
public class AvaliacaoController extends CrudController<Long, Avaliacao, AvaliacaoDTO, AvaliacaoRepository, AvaliacaoService> {

    private final HttpServletRequest request;

    @Value("${app.security.mobile-api-key}")
    private String correctApiKey;

    public AvaliacaoController(HttpServletRequest request) {
        super(Avaliacao.class, AvaliacaoDTO.class);
        this.request = request;
    }

    @Override
    public void customizeMapping() {
        getModelMapper().typeMap(AvaliacaoDTO.class, Avaliacao.class)
                .addMappings(mapper -> mapper.skip(Avaliacao::setStatus));
    }

    @Override
    @GetMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<java.util.List<AvaliacaoDTO>> findAll() {
        return ResponseEntity.ok((java.util.List) service.findAllForResponse());
    }

    @Override
    @GetMapping("/{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<AvaliacaoDTO> findById(@PathVariable Long id) {
        return service.findByIdForResponse(id)
                .map(dto -> (ResponseEntity<AvaliacaoDTO>) (ResponseEntity<?>) ResponseEntity.ok(dto))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/completa")
    public ResponseEntity<Avaliacao> findAvaliacaoCompleta(@PathVariable Long id) {
        return service.findByIdWithAmostrasAndRegiao(id)
                .map(avaliacao -> {
                    avaliacao.getAmostras().size();
                    return ResponseEntity.ok(avaliacao);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cadastro exclusivo da fonte externa (app móvel) via X-API-Key.
     * A aplicação web não deve cadastrar avaliações manualmente.
     */
    @Override
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid AvaliacaoDTO dto) {
        String requestApiKey = this.request.getHeader("X-API-Key");
        if (requestApiKey == null || !requestApiKey.equals(correctApiKey)) {
            throw new ResponseStatusException(
                    HttpStatus.METHOD_NOT_ALLOWED,
                    "O cadastro de avaliações não é permitido pela aplicação web. Utilize a integração autorizada."
            );
        }

        Avaliacao entity = toEntity(dto);
        entity.setRegiao(null);

        if (entity.getAmostras() != null) {
            entity.getAmostras().forEach(amostra -> {
                amostra.setAvaliacao(entity);
                if (amostra.getCamadas() != null) {
                    amostra.getCamadas().forEach(camada -> camada.setAmostra(amostra));
                }
            });
        }

        service.applyStatusFromIngestion(entity, dto.getStatus());
        service.attachRegiaoIfPresent(entity, dto.getRegiaoId());
        Avaliacao savedEntity = service.save(entity);
        return new ResponseEntity<>(savedEntity.getId(), HttpStatus.CREATED);
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<Long> update(@RequestBody @Valid AvaliacaoDTO dto, @PathVariable Long id) {
        AdminAvaliacaoUpdateDTO admin = new AdminAvaliacaoUpdateDTO(
                dto.getNomeAvaliacao(),
                dto.getDataInicio(),
                dto.getDataFim(),
                dto.getResumoAvaliacao(),
                dto.getDescricaoManejoLocal(),
                dto.getAvaliador(),
                dto.getInformacoes(),
                dto.getRegiaoId()
        );
        AvaliacaoResponseDTO updated = service.updateByAdmin(id, admin);
        return ResponseEntity.ok(updated.getId());
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<AvaliacaoResponseDTO> inativar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.inactivate(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<AvaliacaoResponseDTO> reativar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.reactivate(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "A exclusão física de avaliações não é permitida. Utilize a inativação."
        );
    }
}
