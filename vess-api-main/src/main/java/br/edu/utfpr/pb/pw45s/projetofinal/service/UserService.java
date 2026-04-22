package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserMeDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class UserService extends CrudService<Long, User, UserRepository> implements UserDetailsService {

    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$";

    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User save(User user) {
        if (user.getId() != null) {
            repository.findById(user.getId()).ifPresent(existing -> {
                if (user.getProfile() == null) {
                    user.setProfile(existing.getProfile());
                }

                if (user.getStatus() == null) {
                    user.setStatus(existing.getStatus());
                }

                if (user.getPassword() == null || user.getPassword().isBlank()) {
                    user.setPassword(existing.getPassword());
                }
            });
        } else {
            if (user.getProfile() == null) {
                user.setProfile(UserProfile.PESQUISADOR);
            }
            if (user.getStatus() == null) {
                user.setStatus(UserStatus.PENDENTE_EMAIL);
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                throw new IllegalArgumentException("A senha é obrigatória.");
            }
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("A senha não pode ser vazia.");
        }

        if (!isEncodedPassword(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return repository.save(user);
    }

    @Transactional
    public User updateCurrentUser(Long userId, UserMeDTO dto) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + userId));

        String username = normalize(dto.getUsername());
        String email = normalize(dto.getEmail());
        String institution = normalize(dto.getInstitution());
        String country = normalize(dto.getCountry());
        String state = normalize(dto.getState());
        String city = normalize(dto.getCity());

        if (!Objects.equals(user.getUsername(), username)) {
            validateUniqueUsername(username, userId);
        }

        if (!Objects.equals(user.getEmail(), email)) {
            validateUniqueEmail(email, userId);
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setInstitution(institution);
        user.setCountry(country);
        user.setState(state);
        user.setCity(city);

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            validatePassword(dto.getPassword());
            user.setPassword(dto.getPassword());
        }

        return save(user);
    }

    @Transactional
    public User activate(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + userId));
        user.setStatus(UserStatus.ATIVO);
        return repository.save(user);
    }

    @Transactional
    public User deactivate(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + userId));
        if (UserStatus.INATIVO.equals(user.getStatus())) {
            throw new IllegalStateException("Usuário já está inativo.");
        }
        user.setStatus(UserStatus.INATIVO);
        return repository.save(user);
    }

    public List<User> findByStatus(UserStatus status) {
        return repository.findByStatus(status);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    public boolean existsByUsername(String username) {
        return repository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    private void validateUniqueUsername(String username, Long userId) {
        if (repository.existsByUsernameAndIdNot(username, userId)) {
            throw new IllegalArgumentException("O nome de usuário informado já está em uso.");
        }
    }

    private void validateUniqueEmail(String email, Long userId) {
        if (repository.existsByEmailAndIdNot(email, userId)) {
            throw new IllegalArgumentException("O e-mail informado já está em uso.");
        }
    }

    private void validatePassword(String password) {
        if (password.length() < 6 || password.length() > 100 || !password.matches(PASSWORD_REGEX)) {
            throw new IllegalArgumentException("A senha deve ter no mínimo 6 caracteres e conter pelo menos uma letra minúscula, uma maiúscula e um número.");
        }
    }

    private boolean isEncodedPassword(String password) {
        return password != null && password.matches("^\\$2[aby]\\$.+");
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}