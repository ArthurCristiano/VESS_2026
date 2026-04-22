package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import br.edu.utfpr.pb.pw45s.projetofinal.model.EmailConfirmationToken;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.EmailConfirmationTokenRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class EmailConfirmationService {

    private static final Duration TOKEN_EXPIRATION = Duration.ofHours(24);

    private final EmailConfirmationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:}")
    private String frontendUrl;

    public EmailConfirmationService(EmailConfirmationTokenRepository tokenRepository,
                                    UserRepository userRepository,
                                    EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(noRollbackFor = EmailSendException.class)
    public void createAndSendConfirmation(User user, String baseUrl) {
        requireUser(user);
        requireBaseUrl(baseUrl);

        Instant now = Instant.now();
        String tokenValue = UUID.randomUUID().toString().replace("-", "");

        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken(tokenValue);
        token.setUser(user);
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(TOKEN_EXPIRATION));
        tokenRepository.save(token);

        String confirmationLink = buildConfirmationLink(baseUrl, tokenValue);

        String subject = "Confirme seu e-mail";
        String htmlContent = buildEmailContent(user, confirmationLink);
        emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Transactional
    public User confirmEmail(String tokenValue) {
        if (!StringUtils.hasText(tokenValue)) {
            throw new IllegalArgumentException("O token de confirmação é obrigatório.");
        }

        EmailConfirmationToken token = tokenRepository.findByToken(tokenValue.trim())
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmação inválido."));

        if (token.getConfirmedAt() != null) {
            User user = token.getUser();
            if (!UserStatus.ATIVO.equals(user.getStatus())) {
                user.setStatus(UserStatus.ATIVO);
                userRepository.save(user);
            }
            return user;
        }

        Instant now = Instant.now();
        if (token.getExpiresAt().isBefore(now)) {
            throw new IllegalStateException("O link de confirmação expirou. Solicite um novo cadastro.");
        }

        User user = token.getUser();
        if (!UserStatus.ATIVO.equals(user.getStatus())) {
            user.setStatus(UserStatus.ATIVO);
            user = userRepository.save(user);
        }

        if (token.getConfirmedAt() == null) {
            token.setConfirmedAt(now);
            tokenRepository.save(token);
        }

        return user;
    }

    private void requireUser(User user) {
        if (user == null || !StringUtils.hasText(user.getEmail())) {
            throw new IllegalArgumentException("Usuário válido com e-mail é obrigatório para confirmação.");
        }
    }

    private void requireBaseUrl(String baseUrl) {
        if (!StringUtils.hasText(baseUrl)) {
            throw new IllegalArgumentException("A URL base para confirmação é obrigatória.");
        }
    }

    private String buildEmailContent(User user, String confirmationLink) {
        String displayName = StringUtils.hasText(user.getUsername()) ? user.getUsername() : user.getEmail();
        displayName = HtmlUtils.htmlEscape(displayName);

        return """
                <html>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                  <h2>Confirmação de e-mail</h2>
                  <p>Olá, <strong>%s</strong>.</p>
                  <p>Seu cadastro no VESS foi realizado com sucesso.</p>
                  <p>Para ativar sua conta, clique no botão abaixo para confirmar seu e-mail.</p>
                  <p style="margin: 32px 0;">
                    <a href="%s"
                       style="background-color:#1D9E75; color:#fff; padding:12px 24px;
                              text-decoration:none; border-radius:6px; font-size:15px;">
                      Confirmar e-mail
                    </a>
                  </p>
                  <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
                  <p><a href="%s">%s</a></p>
                  <p>Esse link expira em 24 horas.</p>
                  <hr style="border:none; border-top:1px solid #eee; margin-top:40px;">
                  <p style="font-size:12px; color:#999;">VESS — Sistema de Avaliação Visual da Estrutura do Solo</p>
                  </body>
                </html>
                """.formatted(displayName, confirmationLink, confirmationLink, confirmationLink);
    }

    private String buildConfirmationLink(String baseUrl, String tokenValue) {
        String targetBaseUrl = StringUtils.hasText(frontendUrl) ? frontendUrl.trim() : baseUrl.trim();
        String targetPath = StringUtils.hasText(frontendUrl) ? "/confirm-email" : "/auth/confirm-email";

        return UriComponentsBuilder
                .fromUriString(targetBaseUrl)
                .path(targetPath)
                .queryParam("token", tokenValue)
                .toUriString();
    }
}

