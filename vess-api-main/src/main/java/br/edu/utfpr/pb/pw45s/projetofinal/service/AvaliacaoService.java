package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AdminAvaliacaoUpdateDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.AvaliacaoResponseDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Avaliacao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.Regiao;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.AvaliacaoRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.RegiaoRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AvaliacaoService extends CrudService<Long, Avaliacao, AvaliacaoRepository> {

    private final RegiaoRepository regiaoRepository;

    public AvaliacaoService(RegiaoRepository regiaoRepository) {
        this.regiaoRepository = regiaoRepository;
    }

    @Override
    public Avaliacao save(Avaliacao entity) {
        if (entity.getStatus() == null) {
            entity.setStatus(AvaliacaoStatus.ATIVO);
        }
        return repository.save(entity);
    }

    public List<AvaliacaoResponseDTO> findAllForResponse() {
        return repository.findAllWithRegiao().stream()
                .map(AvaliacaoResponseDTO::from)
                .collect(Collectors.toList());
    }

    public Optional<AvaliacaoResponseDTO> findByIdForResponse(Long id) {
        return repository.findByIdWithRegiao(id).map(AvaliacaoResponseDTO::from);
    }

    public Optional<Avaliacao> findByIdWithAmostrasAndRegiao(Long id) {
        return repository.findByIdWithAmostrasAndRegiao(id);
    }

    @Transactional
    public AvaliacaoResponseDTO updateByAdmin(Long id, AdminAvaliacaoUpdateDTO dto) {
        Avaliacao avaliacao = repository.findByIdWithRegiao(id)
                .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrada: " + id));

        if (dto.getNomeAvaliacao() != null) {
            avaliacao.setNomeAvaliacao(dto.getNomeAvaliacao());
        }
        if (dto.getDataInicio() != null) {
            avaliacao.setDataInicio(dto.getDataInicio());
        }
        if (dto.getDataFim() != null) {
            avaliacao.setDataFim(dto.getDataFim());
        }
        if (dto.getResumoAvaliacao() != null) {
            avaliacao.setResumoAvaliacao(dto.getResumoAvaliacao());
        }
        if (dto.getDescricaoManejoLocal() != null) {
            avaliacao.setDescricaoManejoLocal(dto.getDescricaoManejoLocal());
        }
        if (dto.getAvaliador() != null) {
            avaliacao.setAvaliador(dto.getAvaliador());
        }
        if (dto.getInformacoes() != null) {
            avaliacao.setInformacoes(dto.getInformacoes());
        }
        if (dto.getRegiaoId() != null) {
            Regiao regiao = regiaoRepository.findById(dto.getRegiaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Região não encontrada: " + dto.getRegiaoId()));
            avaliacao.setRegiao(regiao);
        }

        return AvaliacaoResponseDTO.from(save(avaliacao));
    }

    @Transactional
    public AvaliacaoResponseDTO inactivate(Long id) {
        Avaliacao avaliacao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrada: " + id));
        if (AvaliacaoStatus.INATIVO.equals(avaliacao.getStatus())) {
            throw new IllegalStateException("A avaliação já está inativa.");
        }
        avaliacao.setStatus(AvaliacaoStatus.INATIVO);
        return AvaliacaoResponseDTO.from(repository.save(avaliacao));
    }

    @Transactional
    public AvaliacaoResponseDTO reactivate(Long id) {
        Avaliacao avaliacao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrada: " + id));
        if (AvaliacaoStatus.ATIVO.equals(avaliacao.getStatus())) {
            throw new IllegalStateException("A avaliação já está ativa.");
        }
        avaliacao.setStatus(AvaliacaoStatus.ATIVO);
        return AvaliacaoResponseDTO.from(repository.save(avaliacao));
    }

    public void applyStatusFromIngestion(Avaliacao avaliacao, String statusRaw) {
        if (statusRaw == null || statusRaw.isBlank()) {
            avaliacao.setStatus(AvaliacaoStatus.ATIVO);
            return;
        }
        if ("INATIVO".equalsIgnoreCase(statusRaw.trim())) {
            avaliacao.setStatus(AvaliacaoStatus.INATIVO);
            return;
        }
        avaliacao.setStatus(AvaliacaoStatus.ATIVO);
    }

    @Transactional
    public void attachRegiaoIfPresent(Avaliacao avaliacao, Long regiaoId) {
        if (regiaoId == null) {
            return;
        }
        Regiao regiao = regiaoRepository.findById(regiaoId)
                .orElseThrow(() -> new EntityNotFoundException("Região não encontrada: " + regiaoId));
        avaliacao.setRegiao(regiao);
    }
}
