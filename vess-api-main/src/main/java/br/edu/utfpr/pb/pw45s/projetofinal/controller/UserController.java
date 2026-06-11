package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.AdminUserUpdateDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserMeDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserProfileUpdateDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.UserService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;


@RestController
@RequestMapping("users")
public class UserController extends CrudController<Long, User, UserDTO, UserRepository, UserService> {

    @Autowired
    private Validator validator;

    public UserController() {
        super(User.class, UserDTO.class);
    }

    @Override
    public UserDTO toDto(User entity) {
        if (entity != null) {
            entity.setPassword(null);
        }
        return super.toDto(entity);
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return null;
        }
        return toDto(user);
    }

    @PutMapping("/me")
    public UserDTO updateCurrentUser(@AuthenticationPrincipal User currentUser, @Valid @RequestBody UserMeDTO dto) {
        User saved = service.updateCurrentUser(currentUser.getId(), dto);
        return toDto(saved);
    }

    @Override
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid UserDTO dto) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "O cadastro de usuários deve ser realizado pelo fluxo público de registro."
        );
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<Long> update(@RequestBody UserDTO dto, @PathVariable Long id) {
        dto.setId(id);
        Set<ConstraintViolation<UserDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            throw new IllegalArgumentException(violations.iterator().next().getMessage());
        }
        AdminUserUpdateDTO admin = new AdminUserUpdateDTO(
                dto.getUsername(),
                dto.getEmail(),
                dto.getInstitution(),
                dto.getCountry(),
                dto.getState(),
                dto.getCity()
        );
        User saved = service.updateByAdmin(id, admin);
        return ResponseEntity.ok(saved.getId());
    }

    @PatchMapping("/{id}/profile")
    public UserDTO updateProfile(@PathVariable Long id, @RequestBody @Valid UserProfileUpdateDTO dto) {
        User saved = service.updateProfileByAdmin(id, dto.getProfile());
        return toDto(saved);
    }

    @PatchMapping("/{id}/inactivate")
    public UserDTO inactivate(@PathVariable Long id) {
        User saved = service.deactivate(id);
        return toDto(saved);
    }

    @PatchMapping("/{id}/activate")
    public UserDTO activate(@PathVariable Long id) {
        User saved = service.activate(id);
        return toDto(saved);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "A exclusão física de usuários não é permitida. Utilize a inativação."
        );
    }

}
