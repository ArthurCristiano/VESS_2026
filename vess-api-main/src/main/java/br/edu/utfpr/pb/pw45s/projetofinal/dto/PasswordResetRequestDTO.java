package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequestDTO(

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email
) {}