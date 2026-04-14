package br.edu.utfpr.pb.pw45s.projetofinal.service;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserSignupDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.mail.EmailSendException;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserStatus;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailConfirmationService emailConfirmationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailConfirmationService emailConfirmationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailConfirmationService = emailConfirmationService;
    }

    @Transactional
    public boolean registerNewUser(UserSignupDTO signupDTO, String baseUrl) {
        if (userRepository.findByUsername(signupDTO.username()).isPresent()) {
            throw new RuntimeException("Erro: Nome de usuário já está em uso!");
        }

        if (userRepository.findByEmail(signupDTO.email()).isPresent()) {
            throw new RuntimeException("Erro: Email já está em uso!");
        }

        User user = new User();
        user.setUsername(signupDTO.username());
        user.setEmail(signupDTO.email());
        user.setPassword(passwordEncoder.encode(signupDTO.password()));
        user.setInstitution(signupDTO.institution());
        user.setCountry(signupDTO.country());
        user.setState(signupDTO.state());
        user.setCity(signupDTO.city());
        user.setProfile(UserProfile.PESQUISADOR);
        user.setStatus(UserStatus.PENDENTE_EMAIL);

        User savedUser = userRepository.save(user);
        try {
            emailConfirmationService.createAndSendConfirmation(savedUser, baseUrl);
            return true;
        } catch (EmailSendException e) {
            log.warn("Usuário {} cadastrado, mas o e-mail de confirmação não pôde ser enviado: {}",
                    savedUser.getEmail(), e.getMessage());
            return false;
        }
    }
}