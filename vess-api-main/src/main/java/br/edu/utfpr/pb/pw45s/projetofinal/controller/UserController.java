package br.edu.utfpr.pb.pw45s.projetofinal.controller;

import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserMeDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.dto.UserDTO;
import br.edu.utfpr.pb.pw45s.projetofinal.model.User;
import br.edu.utfpr.pb.pw45s.projetofinal.repository.UserRepository;
import br.edu.utfpr.pb.pw45s.projetofinal.service.UserService;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudController;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("users")
public class UserController extends CrudController<Long, User, UserDTO, UserRepository, UserService> {

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

}