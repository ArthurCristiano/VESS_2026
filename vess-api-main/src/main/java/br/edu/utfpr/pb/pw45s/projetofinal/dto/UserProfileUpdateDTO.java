package br.edu.utfpr.pb.pw45s.projetofinal.dto;

import br.edu.utfpr.pb.pw45s.projetofinal.model.enums.UserProfile;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileUpdateDTO {

    @NotNull(message = "O perfil do usuário deve ser informado.")
    private UserProfile profile;
}
