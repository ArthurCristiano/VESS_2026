package br.edu.utfpr.pb.pw45s.projetofinal.model;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.Identifiable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import br.edu.utfpr.pb.pw45s.projetofinal.security.SecurityConstants;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails, Identifiable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O atributo usuário não pode ser nulo.")
    @Size(min = 4, max = 50)
    private String username;

    @NotNull(message = "O atributo email não pode ser nulo.")
    @Column(unique = true)
    @Size(min = 10)
    private String email;

    @NotNull(message = "A instituição não pode ser nula.")
    @Size(min = 2, max = 100, message = "A instituição deve ter entre 2 e 100 caracteres.")
    private String institution;

    @NotNull(message = "O país não pode ser nulo.")
    @Size(min = 2, max = 50, message = "O país deve ter entre 2 e 50 caracteres.")
    private String country;

    @NotNull(message = "O estado não pode ser nulo.")
    @Size(min = 2, max = 50, message = "O estado deve ter entre 2 e 50 caracteres.")
    private String state;

    @NotNull(message = "A cidade não pode ser nula.")
    @Size(min = 2, max = 50, message = "A cidade deve ter entre 2 e 50 caracteres.")
    private String city;

    @NotNull(message = "O atributo password não pode ser nulo.")
    @Size(min = 6)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private UserProfile profile = UserProfile.PESQUISADOR;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(SecurityConstants.ROLE_USER));
        switch (profile) {
            case ADMINISTRADOR ->
                    authorities.add(new SimpleGrantedAuthority(SecurityConstants.ROLE_ADMINISTRADOR));
            case PESQUISADOR ->
                    authorities.add(new SimpleGrantedAuthority(SecurityConstants.ROLE_PESQUISADOR));
        }
        return authorities;
    }
}
