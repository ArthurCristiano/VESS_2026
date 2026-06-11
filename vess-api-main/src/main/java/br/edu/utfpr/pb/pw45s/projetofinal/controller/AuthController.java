package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.EmailConfirmationResultDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserSignupDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.service.AuthService;
import br.edu.utfpr.pb.pw45s.projetofinal.service.EmailConfirmationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String EMAIL_CONFIRMED_PENDING_APPROVAL_MESSAGE =
            "E-mail confirmado com sucesso. Seu cadastro aguarda aprovação de um administrador.";

    private final AuthService authService;
    private final EmailConfirmationService emailConfirmationService;

    public AuthController(AuthService authService, EmailConfirmationService emailConfirmationService) {
        this.authService = authService;
        this.emailConfirmationService = emailConfirmationService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserSignupDTO userToRegister) {
        try {
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            boolean confirmationEmailSent = authService.registerNewUser(userToRegister, baseUrl);
            String message = confirmationEmailSent
                    ? "Usuário registrado com sucesso! Verifique seu e-mail para confirmar a conta."
                    : "Usuário registrado com sucesso, mas não foi possível enviar o e-mail de confirmação agora. Tente novamente mais tarde.";
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<String> confirmEmail(@RequestParam String token) {
        try {
            var user = emailConfirmationService.confirmEmail(token);
            return ResponseEntity.ok(EMAIL_CONFIRMED_PENDING_APPROVAL_MESSAGE);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/confirm-email/verify")
    public ResponseEntity<EmailConfirmationResultDTO> verifyEmailConfirmation(@RequestParam String token) {
        try {
            var user = emailConfirmationService.confirmEmail(token);
            return ResponseEntity.ok(new EmailConfirmationResultDTO(
                    true,
                    EMAIL_CONFIRMED_PENDING_APPROVAL_MESSAGE,
                    user.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new EmailConfirmationResultDTO(
                    false,
                    e.getMessage(),
                    null
            ));
        }
    }
}