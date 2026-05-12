package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "regiao_ponto")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class RegiaoPonto implements Identifiable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regiao_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Regiao regiao;

    @NotNull(message = "A ordem do ponto é obrigatória.")
    @Min(value = 1,  message = "A ordem mínima é 1.")
    @Max(value = 10, message = "A ordem máxima é 10.")
    @Column(nullable = false)
    private Integer ordem;

    @NotNull(message = "A latitude é obrigatória.")
    @DecimalMin(value = "-90.0",  message = "Latitude mínima é -90.")
    @DecimalMax(value = "90.0",   message = "Latitude máxima é 90.")
    @Column(nullable = false)
    private Double latitude;

    @NotNull(message = "A longitude é obrigatória.")
    @DecimalMin(value = "-180.0", message = "Longitude mínima é -180.")
    @DecimalMax(value = "180.0",  message = "Longitude máxima é 180.")
    @Column(nullable = false)
    private Double longitude;
}