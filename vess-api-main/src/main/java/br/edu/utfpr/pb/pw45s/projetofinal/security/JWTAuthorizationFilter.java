package br.edu.utfpr.pb.pw45s.projetofinal.security;

import br.edu.utfpr.pb.pw45s.projetofinal.service.UserService;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.io.IOException;

public class JWTAuthorizationFilter extends BasicAuthenticationFilter {

    private static final AntPathRequestMatcher AUTH_LOGIN_POST =
            new AntPathRequestMatcher("/auth/login", "POST");
    private static final AntPathRequestMatcher AUTH_REGISTER_POST =
            new AntPathRequestMatcher("/auth/register", "POST");

    private final UserService userService;

    public JWTAuthorizationFilter(AuthenticationManager authenticationManager, UserService userService) {
        super(authenticationManager);
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws IOException, ServletException {

        if (AUTH_LOGIN_POST.matches(request) || AUTH_REGISTER_POST.matches(request)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(SecurityConstants.HEADER_STRING);

        if (header == null || !header.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication = getAuthentication(request);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request) {
        String token = request.getHeader(SecurityConstants.HEADER_STRING);
        if (token != null) {
            try {
                String jwt = token.replace(SecurityConstants.TOKEN_PREFIX, "").trim();
                DecodedJWT headerOnly = JWT.decode(jwt);
                Algorithm algorithm = hmacAlgorithmForHeader(headerOnly.getAlgorithm());
                JWTVerifier verifier = JWT.require(algorithm).build();
                DecodedJWT decodedJWT = verifier.verify(jwt);

                System.out.println("Subject do Token JWT: " + decodedJWT.getSubject());
                String username = decodedJWT.getSubject();

                if (username != null) {
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    if (!userDetails.isEnabled()
                            || !userDetails.isAccountNonLocked()
                            || !userDetails.isAccountNonExpired()
                            || !userDetails.isCredentialsNonExpired()) {
                        return null;
                    }
                    return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                }
            } catch (Exception e) {
                System.err.println("Falha na validação do JWT: " + e.getMessage());
                return null;
            }
        }
        return null;
    }

    /**
     * Usa o algoritmo declarado no header do JWT (HMAC) para validar a assinatura.
     * Evita "Algorithm doesn't match" quando o token foi emitido com HS256/HS384/HS512
     * e mantém o mesmo segredo simétrico em todos os casos desta API.
     */
    private static Algorithm hmacAlgorithmForHeader(String algorithm) {
        if (algorithm == null) {
            throw new IllegalArgumentException("JWT sem campo alg no header.");
        }
        byte[] secret = SecurityConstants.SECRET.getBytes();
        return switch (algorithm) {
            case "HS256" -> Algorithm.HMAC256(secret);
            case "HS384" -> Algorithm.HMAC384(secret);
            case "HS512" -> Algorithm.HMAC512(secret);
            default -> throw new IllegalArgumentException(
                    "Algoritmo JWT não suportado nesta API: " + algorithm
                            + ". Use um token emitido pelo login deste serviço (HMAC HS256/384/512)."
            );
        };
    }
}

