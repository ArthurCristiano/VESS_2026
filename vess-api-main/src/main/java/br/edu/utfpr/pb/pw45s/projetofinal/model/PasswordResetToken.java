package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class PasswordResetToken implements Identifiable<Long> {

    public static final int EXPIRATION_MINUTES = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false, name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(nullable = false, name = "used")
    private boolean used = false;

    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiresAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
        this.used = false;
    }

    public boolean isValid() {
        return !used && LocalDateTime.now().isBefore(expiresAt);
    }
}