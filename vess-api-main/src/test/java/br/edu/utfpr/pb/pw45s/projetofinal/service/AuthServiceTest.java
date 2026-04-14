package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserSignupDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailConfirmationService emailConfirmationService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerNewUserCreatesPendingUserAndSendsConfirmationEmail() {
        UserSignupDTO signupDTO = new UserSignupDTO(
                "maria.silva",
                "maria@example.com",
                "UTFPR",
                "Brasil",
                "Paraná",
                "Curitiba",
                "Senha123"
        );

        when(userRepository.findByUsername(signupDTO.username())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(signupDTO.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(signupDTO.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean emailSent = authService.registerNewUser(signupDTO, "http://localhost:8099/server");

        assertTrue(emailSent);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals(signupDTO.username(), savedUser.getUsername());
        assertEquals(signupDTO.email(), savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals(UserProfile.PESQUISADOR, savedUser.getProfile());
        assertEquals(UserStatus.PENDENTE_EMAIL, savedUser.getStatus());

        verify(emailConfirmationService).createAndSendConfirmation(savedUser, "http://localhost:8099/server");
    }

    @Test
    void registerNewUserRejectsDuplicatedEmail() {
        UserSignupDTO signupDTO = new UserSignupDTO(
                "maria.silva",
                "maria@example.com",
                "UTFPR",
                "Brasil",
                "Paraná",
                "Curitiba",
                "Senha123"
        );

        when(userRepository.findByUsername(signupDTO.username())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(signupDTO.email())).thenReturn(Optional.of(new User()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.registerNewUser(signupDTO, "http://localhost:8099/server"));

        assertEquals("Erro: Email já está em uso!", exception.getMessage());
        verifyNoInteractions(emailConfirmationService);
    }

    @Test
    void registerNewUserKeepsUserWhenEmailSendingFails() {
        UserSignupDTO signupDTO = new UserSignupDTO(
                "maria.silva",
                "maria@example.com",
                "UTFPR",
                "Brasil",
                "Paraná",
                "Curitiba",
                "Senha123"
        );

        when(userRepository.findByUsername(signupDTO.username())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(signupDTO.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(signupDTO.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        org.mockito.Mockito.doThrow(new EmailSendException("Falha no SMTP", new RuntimeException("auth")))
                .when(emailConfirmationService).createAndSendConfirmation(any(User.class), any());

        boolean emailSent = authService.registerNewUser(signupDTO, "http://localhost:8099/server");

        assertFalse(emailSent);
        verify(userRepository).save(any(User.class));
    }
}

