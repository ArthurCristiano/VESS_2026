package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void activateInactiveUserSetsActive() {
        User user = buildUser(42L, UserStatus.INATIVO);

        when(repository.findById(42L)).thenReturn(Optional.of(user));
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User activated = userService.activate(42L);

        assertEquals(UserStatus.ATIVO, activated.getStatus());
        verify(repository).save(user);
    }

    @Test
    void activatePendingEmailUserThrows() {
        User user = buildUser(42L, UserStatus.PENDENTE_EMAIL);

        when(repository.findById(42L)).thenReturn(Optional.of(user));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> userService.activate(42L));

        assertEquals(
                "Usuário ainda não confirmou o e-mail. A ativação só é permitida após a confirmação.",
                exception.getMessage()
        );
        verify(repository, never()).save(any());
    }

    @Test
    void activateAlreadyActiveUserThrows() {
        User user = buildUser(42L, UserStatus.ATIVO);

        when(repository.findById(42L)).thenReturn(Optional.of(user));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> userService.activate(42L));

        assertEquals("Usuário já está ativo.", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void deactivateActiveUserSetsInactive() {
        User user = buildUser(42L, UserStatus.ATIVO);

        when(repository.findById(42L)).thenReturn(Optional.of(user));
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User deactivated = userService.deactivate(42L);

        assertEquals(UserStatus.INATIVO, deactivated.getStatus());
        verify(repository).save(user);
    }

    @Test
    void activateNonExistentUserThrows() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class,
                () -> userService.activate(99L));

        assertEquals("Usuário não encontrado: 99", exception.getMessage());
        verify(repository, never()).save(any());
    }

    private User buildUser(Long id, UserStatus status) {
        User user = new User();
        user.setId(id);
        user.setUsername("usuario.teste");
        user.setEmail("usuario@example.com");
        user.setStatus(status);
        return user;
    }
}
