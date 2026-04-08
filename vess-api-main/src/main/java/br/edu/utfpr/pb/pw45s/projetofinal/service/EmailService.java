package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.config.AppMailProperties;
import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final AppMailProperties mailProperties;

    public EmailService(JavaMailSender mailSender, AppMailProperties mailProperties) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        requireRecipient(to);
        requireSubject(subject);
        requireBody(text);

        if (!mailProperties.isEnabled()) {
            log.debug("Envio de e-mail ignorado: app.mail.enabled=false (simples, para={})", to);
            return;
        }

        String from = requireFromAddress();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to.trim());
            message.setSubject(subject.trim());
            message.setText(text);
            mailSender.send(message);
        } catch (MailException e) {
            log.error("Falha ao enviar e-mail simples para {}: {}", to, e.getMessage());
            throw new EmailSendException("Não foi possível enviar o e-mail (texto simples).", e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        requireRecipient(to);
        requireSubject(subject);
        requireBody(htmlContent);

        if (!mailProperties.isEnabled()) {
            log.debug("Envio de e-mail ignorado: app.mail.enabled=false (HTML, para={})", to);
            return;
        }

        String from = requireFromAddress();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to.trim());
            helper.setSubject(subject.trim());
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Falha ao montar e-mail HTML para {}: {}", to, e.getMessage());
            throw new EmailSendException("Não foi possível montar o e-mail HTML.", e);
        } catch (MailException e) {
            log.error("Falha ao enviar e-mail HTML para {}: {}", to, e.getMessage());
            throw new EmailSendException("Não foi possível enviar o e-mail HTML.", e);
        }
    }

    private void requireRecipient(String to) {
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("O destinatário (to) é obrigatório.");
        }
    }

    private void requireSubject(String subject) {
        if (!StringUtils.hasText(subject)) {
            throw new IllegalArgumentException("O assunto (subject) é obrigatório.");
        }
    }

    private void requireBody(String body) {
        if (!StringUtils.hasText(body)) {
            throw new IllegalArgumentException("O conteúdo do e-mail é obrigatório.");
        }
    }

    private String requireFromAddress() {
        String from = mailProperties.getFrom();
        if (!StringUtils.hasText(from)) {
            throw new IllegalStateException(
                    "app.mail.from (ou MAIL_FROM / MAIL_USERNAME) não está configurado.");
        }
        return from.trim();
    }
}
