package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
public class AdminNotificationService {

    private static final Logger log = LoggerFactory.getLogger(AdminNotificationService.class);
    private static final String SUBJECT = "Novo cadastro aguardando aprovação — VESS";

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:}")
    private String frontendUrl;

    public AdminNotificationService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public void notifyNewRegistrationPendingApproval(User newUser) {
        if (newUser == null) {
            return;
        }

        List<User> admins = userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO);
        if (admins.isEmpty()) {
            log.warn("Nenhum administrador ativo encontrado para notificar sobre o cadastro de {}",
                    newUser.getEmail());
            return;
        }

        for (User admin : admins) {
            try {
                String html = buildAdminNotificationContent(admin, newUser);
                emailService.sendHtmlEmail(admin.getEmail(), SUBJECT, html);
            } catch (EmailSendException e) {
                log.warn("Falha ao notificar administrador {} sobre novo cadastro de {}: {}",
                        admin.getEmail(), newUser.getEmail(), e.getMessage());
            }
        }
    }

    private String buildAdminNotificationContent(User admin, User newUser) {
        String adminName = escapeDisplayName(admin);
        String newUserName = escapeDisplayName(newUser);
        String newUserEmail = HtmlUtils.htmlEscape(newUser.getEmail());
        String institution = StringUtils.hasText(newUser.getInstitution())
                ? HtmlUtils.htmlEscape(newUser.getInstitution())
                : "Não informada";
        String panelLink = buildPanelLink();

        String panelSection = StringUtils.hasText(panelLink)
                ? """
                  <p>Acesse o painel administrativo para analisar e ativar o cadastro, se desejar:</p>
                  <p style="margin: 32px 0;">
                    <a href="%s"
                       style="background-color:#1D9E75; color:#fff; padding:12px 24px;
                              text-decoration:none; border-radius:6px; font-size:15px;">
                      Abrir painel de usuários
                    </a>
                  </p>
                  <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
                  <p><a href="%s">%s</a></p>
                  """.formatted(panelLink, panelLink, panelLink)
                : """
                  <p>Acesse o painel administrativo em <strong>Cadastro de usuários</strong>
                     para analisar e ativar o cadastro, se desejar.</p>
                  """;

        return """
                <html>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                  <h2>Novo cadastro aguardando aprovação</h2>
                  <p>Olá, <strong>%s</strong>.</p>
                  <p>Um novo usuário confirmou o e-mail e aguarda aprovação para acessar o sistema.</p>
                  <p>O usuário <strong>%s</strong> (%s) confirmou o e-mail e aguarda aprovação para acessar o VESS.</p>
                  <p>Instituição: %s</p>
                  %s
                  <hr style="border:none; border-top:1px solid #eee; margin-top:40px;">
                  <p style="font-size:12px; color:#999;">VESS — Sistema de Avaliação Visual da Estrutura do Solo</p>
                </body>
                </html>
                """.formatted(adminName, newUserName, newUserEmail, institution, panelSection);
    }

    private String buildPanelLink() {
        if (!StringUtils.hasText(frontendUrl)) {
            return "";
        }

        return UriComponentsBuilder
                .fromUriString(frontendUrl.trim())
                .path("/admin/usuarios")
                .toUriString();
    }

    private String escapeDisplayName(User user) {
        String displayName = StringUtils.hasText(user.getUsername()) ? user.getUsername() : user.getEmail();
        return HtmlUtils.htmlEscape(displayName);
    }
}
