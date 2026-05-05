package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.RegiaoTipo;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "regiao")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Regiao implements Identifiable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da região é obrigatório.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    @Column(nullable = false, length = 100)
    private String nome;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
    @Column(length = 500)
    private String descricao;

    @NotNull(message = "O tipo da região é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegiaoTipo tipo;

    @Column(nullable = false)
    private boolean ativa = true;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    private void prePersist() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}