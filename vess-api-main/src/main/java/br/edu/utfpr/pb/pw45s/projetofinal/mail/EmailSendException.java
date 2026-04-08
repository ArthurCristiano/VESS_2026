package br.edu.utfpr.pb.pw45s.projetofinal.mail;

public class EmailSendException extends RuntimeException {

    public EmailSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
