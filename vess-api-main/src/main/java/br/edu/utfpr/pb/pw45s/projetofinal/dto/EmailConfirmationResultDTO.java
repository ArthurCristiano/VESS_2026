package br.edu.utfpr.pb.pw45s.projetofinal.dto;

public record EmailConfirmationResultDTO(
        boolean success,
        String message,
        String email
) {
}

