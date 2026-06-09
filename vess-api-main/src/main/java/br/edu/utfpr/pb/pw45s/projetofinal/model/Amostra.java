package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "amostra")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Amostra implements Identifiable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "avaliacao_id")
    @JsonIgnoreProperties("amostras")
    @ToString.Exclude
    private Avaliacao avaliacao;

    @Column(name = "nome_amostra")
    private String nomeAmostra;

    @Column(name = "numero_camadas")
    private Integer numeroCamadas;

    @Column(name = "arquivo_upload")
    private String arquivoUpload;

    @Column(name = "imagem_url", length = 2048)
    private String imagemUrl;

    @Column(name = "escore_qe_vess")
    private Float escoreQeVess;

    @Column(name = "descricao_manejo")
    private String descricaoManejo;

    @Column(name = "nota_amostra")
    private String notaAmostra;

    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @Column(name = "ordem_amostra")
    private Integer ordemAmostra;


    private String localizacao;

    @OneToMany(mappedBy = "amostra", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Camada> camadas;
}
