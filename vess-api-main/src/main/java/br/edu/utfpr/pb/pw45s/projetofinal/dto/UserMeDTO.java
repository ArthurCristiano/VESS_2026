package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserMeDTO {

    @NotBlank(message = "O atributo username não pode ser nulo.")
    @Size(min = 4, max = 50, message = "O atributo username deve conter no mínimo 4 caracteres.")
    private String username;

    @NotBlank(message = "O atributo email não pode ser nulo.")
    @Email(message = "O formato do email é inválido.")
    private String email;

    @NotNull(message = "A instituição não pode ser nula.")
    @Size(min = 2, max = 100, message = "A instituição deve ter entre 2 e 100 caracteres.")
    private String institution;

    @NotNull(message = "O país não pode ser nulo.")
    @Size(min = 2, max = 50, message = "O país deve ter entre 2 e 50 caracteres.")
    private String country;

    @NotNull(message = "O estado não pode ser nulo.")
    @Size(min = 2, max = 50, message = "O estado deve ter entre 2 e 50 caracteres.")
    private String state;

    @NotNull(message = "A cidade não pode ser nula.")
    @Size(min = 2, max = 50, message = "A cidade deve ter entre 2 e 50 caracteres.")
    private String city;

    // Opcional: vazio/nulo significa manter a senha atual.
    private String password;
}

