package br.edu.utfpr.pb.pw45s.projetofinal.repository;

import br.edu.utfpr.pb.pw45s.projetofinal.model.EmailConfirmationToken;
import br.edu.utfpr.pb.pw45s.projetofinal.shared.CrudRepository;

import java.util.Optional;

public interface EmailConfirmationTokenRepository extends CrudRepository<Long, EmailConfirmationToken> {

    Optional<EmailConfirmationToken> findByToken(String token);
}

