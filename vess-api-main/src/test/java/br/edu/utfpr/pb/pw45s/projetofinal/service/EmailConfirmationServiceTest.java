package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.model.EmailConfirmationToken;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.EmailConfirmationTokenRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailConfirmationServiceTest {

    @Mock
    private EmailConfirmationTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmailConfirmationService emailConfirmationService;

    @Test
    void createAndSendConfirmationGeneratesTokenAndSendsEmail() {
        User user = new User();
        user.setEmail("maria@example.com");
        user.setUsername("Maria");

        when(tokenRepository.save(any(EmailConfirmationToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        emailConfirmationService.createAndSendConfirmation(user, "http://localhost:8099/server");

        ArgumentCaptor<EmailConfirmationToken> tokenCaptor = ArgumentCaptor.forClass(EmailConfirmationToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());

        EmailConfirmationToken savedToken = tokenCaptor.getValue();
        assertEquals(user, savedToken.getUser());
        assertNotNull(savedToken.getToken());
        assertNotNull(savedToken.getCreatedAt());
        assertNotNull(savedToken.getExpiresAt());
        assertTrue(savedToken.getExpiresAt().isAfter(savedToken.getCreatedAt()));

        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendHtmlEmail(eq("maria@example.com"), eq("Confirme seu e-mail"), htmlCaptor.capture());
        assertTrue(htmlCaptor.getValue().contains("/auth/confirm-email?token=" + savedToken.getToken()));
    }

    @Test
    void confirmEmailActivatesUserAndMarksTokenAsConfirmed() {
        User user = new User();
        user.setEmail("maria@example.com");
        user.setStatus(UserStatus.PENDENTE_EMAIL);

        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken("token-123");
        token.setUser(user);
        token.setCreatedAt(Instant.now().minus(Duration.ofMinutes(10)));
        token.setExpiresAt(Instant.now().plus(Duration.ofHours(1)));

        when(tokenRepository.findByToken("token-123")).thenReturn(Optional.of(token));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenRepository.save(any(EmailConfirmationToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User confirmedUser = emailConfirmationService.confirmEmail("token-123");

        assertEquals(UserStatus.ATIVO, confirmedUser.getStatus());
        assertNotNull(token.getConfirmedAt());
        verify(userRepository).save(user);
        verify(tokenRepository).save(token);
    }

    @Test
    void confirmEmailWithExpiredTokenThrows() {
        User user = new User();
        user.setEmail("maria@example.com");
        user.setStatus(UserStatus.PENDENTE_EMAIL);

        EmailConfirmationToken token = new EmailConfirmationToken();
        token.setToken("token-expirado");
        token.setUser(user);
        token.setCreatedAt(Instant.now().minus(Duration.ofDays(2)));
        token.setExpiresAt(Instant.now().minus(Duration.ofHours(1)));

        when(tokenRepository.findByToken("token-expirado")).thenReturn(Optional.of(token));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> emailConfirmationService.confirmEmail("token-expirado"));

        assertEquals("O link de confirmação expirou. Solicite um novo cadastro.", exception.getMessage());
        verify(userRepository, never()).save(any());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void confirmEmailWithUnknownTokenThrows() {
        when(tokenRepository.findByToken("inexistente")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> emailConfirmationService.confirmEmail("inexistente"));

        assertEquals("Token de confirmação inválido.", exception.getMessage());
        verifyNoInteractions(userRepository);
    }
}

