package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.PasswordResetDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.PasswordResetRequestDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.PasswordResetToken;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.PasswordResetTokenRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequestDTO dto) {
        Optional<User> optionalUser = userRepository.findByEmail(dto.email());

        if (optionalUser.isEmpty()) {
            log.info("Solicitação de recuperação para e-mail não cadastrado: {}", dto.email());
            return;
        }

        User user = optionalUser.get();

        tokenRepository.deleteByUser(user);

        String tokenValue = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken resetToken = new PasswordResetToken(tokenValue, user);

        tokenRepository.save(resetToken);

        sendResetEmail(user, tokenValue);

        log.info("Token de recuperação gerado para o usuário id={}", user.getId());
    }

    @Transactional
    public void resetPassword(PasswordResetDTO dto) {
        PasswordResetToken resetToken = tokenRepository.findByToken(dto.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinição inválido."));

        if (!resetToken.isValid()) {
            if (resetToken.isUsed()) {
                throw new IllegalArgumentException("Este link de redefinição já foi utilizado.");
            }
            throw new IllegalArgumentException(
                    "O link de redefinição expirou. Solicite um novo link.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);

        // Marca o token como usado para impedir reutilização do mesmo link
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Senha redefinida com sucesso para o usuário id={}", user.getId());
    }

    public void validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinição inválido."));

        if (!resetToken.isValid()) {
            if (resetToken.isUsed()) {
                throw new IllegalArgumentException("Este link de redefinição já foi utilizado.");
            }
            throw new IllegalArgumentException(
                    "O link de redefinição expirou. Solicite um novo link.");
        }
    }

    @Transactional
    public void cleanExpiredTokens() {
        tokenRepository.deleteExpiredAndUsed(LocalDateTime.now());
        log.debug("Tokens de recuperação expirados/usados removidos.");
    }

    private void sendResetEmail(User user, String tokenValue) {
        String resetLink = frontendUrl + "/auth/reset-password?token=" + tokenValue;

        String html = """
                <html>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                  <h2>Redefinição de senha</h2>
                  <p>Olá, <strong>%s</strong>.</p>
                  <p>Recebemos uma solicitação para redefinir a senha da sua conta no VESS.</p>
                  <p>Clique no botão abaixo para criar uma nova senha. Este link é válido por
                     <strong>%d minutos</strong>.</p>
                  <p style="margin: 32px 0;">
                    <a href="%s"
                       style="background-color:#1D9E75; color:#fff; padding:12px 24px;
                              text-decoration:none; border-radius:6px; font-size:15px;">
                      Redefinir senha
                    </a>
                  </p>
                  <p>Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece inalterada.</p>
                  <hr style="border:none; border-top:1px solid #eee; margin-top:40px;">
                  <p style="font-size:12px; color:#999;">VESS — Sistema de Avaliação Visual da Estrutura do Solo</p>
                </body>
                </html>
                """.formatted(
                user.getUsername(),
                PasswordResetToken.EXPIRATION_MINUTES,
                resetLink
        );

        emailService.sendHtmlEmail(user.getEmail(), "Redefinição de senha — VESS", html);
    }
}