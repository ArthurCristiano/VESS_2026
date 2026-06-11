package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminNotificationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AdminNotificationService adminNotificationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminNotificationService, "frontendUrl", "http://localhost:8641");
    }

    @Test
    void notifySendsEmailToAllActiveAdmins() {
        User newUser = buildNewUser();

        User adminOne = buildAdmin("admin1@example.com", "Admin Um");
        User adminTwo = buildAdmin("admin2@example.com", "Admin Dois");

        when(userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO))
                .thenReturn(List.of(adminOne, adminTwo));

        adminNotificationService.notifyNewRegistrationPendingApproval(newUser);

        verify(emailService, times(2)).sendHtmlEmail(
                org.mockito.ArgumentMatchers.anyString(),
                eq("Novo cadastro aguardando aprovação — VESS"),
                org.mockito.ArgumentMatchers.anyString()
        );
        verify(emailService).sendHtmlEmail(eq("admin1@example.com"),
                eq("Novo cadastro aguardando aprovação — VESS"),
                org.mockito.ArgumentMatchers.anyString());
        verify(emailService).sendHtmlEmail(eq("admin2@example.com"),
                eq("Novo cadastro aguardando aprovação — VESS"),
                org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void notifySkipsWhenNoActiveAdmins() {
        User newUser = buildNewUser();

        when(userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO))
                .thenReturn(List.of());

        adminNotificationService.notifyNewRegistrationPendingApproval(newUser);

        verifyNoInteractions(emailService);
    }

    @Test
    void notifyEmailDoesNotContainApprovalLink() {
        User newUser = buildNewUser();
        User admin = buildAdmin("admin@example.com", "Administrador");

        when(userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO))
                .thenReturn(List.of(admin));

        adminNotificationService.notifyNewRegistrationPendingApproval(newUser);

        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtmlEmail(eq("admin@example.com"),
                eq("Novo cadastro aguardando aprovação — VESS"),
                htmlCaptor.capture());

        String html = htmlCaptor.getValue();
        assertFalse(html.contains("/activate"));
        assertFalse(html.contains("Aprovar cadastro"));
        assertFalse(html.contains("token="));
    }

    @Test
    void notifyEmailContainsPanelLink() {
        User newUser = buildNewUser();
        User admin = buildAdmin("admin@example.com", "Administrador");

        when(userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO))
                .thenReturn(List.of(admin));

        adminNotificationService.notifyNewRegistrationPendingApproval(newUser);

        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtmlEmail(eq("admin@example.com"),
                eq("Novo cadastro aguardando aprovação — VESS"),
                htmlCaptor.capture());

        assertTrue(htmlCaptor.getValue().contains("/admin/usuarios"));
        assertTrue(htmlCaptor.getValue().contains("Maria Nova"));
        assertTrue(htmlCaptor.getValue().contains("maria.nova@example.com"));
        assertTrue(htmlCaptor.getValue().contains("UTFPR"));
    }

    @Test
    void notifyContinuesWhenEmailSendFailsForOneAdmin() {
        User newUser = buildNewUser();
        User adminOne = buildAdmin("admin1@example.com", "Admin Um");
        User adminTwo = buildAdmin("admin2@example.com", "Admin Dois");

        when(userRepository.findByProfileAndStatus(UserProfile.ADMINISTRADOR, UserStatus.ATIVO))
                .thenReturn(List.of(adminOne, adminTwo));
        doThrow(new EmailSendException("Falha SMTP", new RuntimeException("timeout")))
                .when(emailService).sendHtmlEmail(eq("admin1@example.com"),
                        eq("Novo cadastro aguardando aprovação — VESS"),
                        org.mockito.ArgumentMatchers.anyString());

        adminNotificationService.notifyNewRegistrationPendingApproval(newUser);

        verify(emailService).sendHtmlEmail(eq("admin2@example.com"),
                eq("Novo cadastro aguardando aprovação — VESS"),
                org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void notifyDoesNothingWhenNewUserIsNull() {
        adminNotificationService.notifyNewRegistrationPendingApproval(null);

        verify(userRepository, never()).findByProfileAndStatus(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        );
        verifyNoInteractions(emailService);
    }

    private User buildNewUser() {
        User newUser = new User();
        newUser.setUsername("Maria Nova");
        newUser.setEmail("maria.nova@example.com");
        newUser.setInstitution("UTFPR");
        return newUser;
    }

    private User buildAdmin(String email, String username) {
        User admin = new User();
        admin.setEmail(email);
        admin.setUsername(username);
        admin.setProfile(UserProfile.ADMINISTRADOR);
        admin.setStatus(UserStatus.ATIVO);
        return admin;
    }
}
