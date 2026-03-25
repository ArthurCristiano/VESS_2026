package br.edu.utfpr.pb.pw45s.projetofinal.service;

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

@Service
public class UserService extends CrudService<Long, User, UserRepository> implements UserDetailsService {

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
            });
        } else {
            if (user.getProfile() == null) {
                user.setProfile(UserProfile.PESQUISADOR);
            }
            if (user.getStatus() == null) {
                user.setStatus(UserStatus.PENDENTE_EMAIL);
            }
        }
        if (!user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return super.save(user);
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
}