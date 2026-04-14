package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.PasswordResetDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.PasswordResetRequestDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequestDTO dto) {
        passwordResetService.requestPasswordReset(dto);
        return ResponseEntity.ok(
                "Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.");
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<String> validateToken(@RequestParam String token) {
        try {
            passwordResetService.validateToken(token);
            return ResponseEntity.ok("Token válido.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDTO dto) {
        try {
            passwordResetService.resetPassword(dto);
            return ResponseEntity.ok("Senha redefinida com sucesso. Você já pode fazer login.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}