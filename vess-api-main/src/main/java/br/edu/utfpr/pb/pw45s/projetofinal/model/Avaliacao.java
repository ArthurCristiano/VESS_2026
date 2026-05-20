package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.AvaliacaoStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "avaliacao")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Avaliacao implements Identifiable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "configuracao_id")
    private Configuracao configuracao;

    @Column(name = "nome_avaliacao")
    private String nomeAvaliacao;

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "resumo_avaliacao")
    private String resumoAvaliacao;

    @Column(name = "descricao_manejo_local")
    private String descricaoManejoLocal;

    @Column(name = "total_amostras")
    private Integer totalAmostras;

    @Column(name = "escore_medio_geral")
    private Float escoreMedioGeral;

    @OneToMany(mappedBy = "avaliacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Amostra> amostras;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regiao_id")
    @JsonIgnoreProperties({"pontos", "hibernateLazyInitializer", "handler"})
    private Regiao regiao;

    private String avaliador;
    private String informacoes;

    @Column(name = "status")
    private AvaliacaoStatus status = AvaliacaoStatus.ATIVO;
}