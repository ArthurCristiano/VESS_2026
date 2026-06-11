package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserAccessTest {

    @Test
    void activeUserCanAuthenticate() {
        User user = buildUser(UserStatus.ATIVO);

        assertTrue(user.isEnabled());
        assertTrue(user.isAccountNonLocked());
    }

    @Test
    void pendingEmailUserIsDisabled() {
        User user = buildUser(UserStatus.PENDENTE_EMAIL);

        assertFalse(user.isEnabled());
        assertTrue(user.isAccountNonLocked());
    }

    @Test
    void inactiveUserIsLocked() {
        User user = buildUser(UserStatus.INATIVO);

        assertFalse(user.isEnabled());
        assertFalse(user.isAccountNonLocked());
    }

    private User buildUser(UserStatus status) {
        User user = new User();
        user.setUsername("usuario.teste");
        user.setEmail("usuario@example.com");
        user.setStatus(status);
        return user;
    }
}
