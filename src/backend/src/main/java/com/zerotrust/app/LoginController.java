package com.zerotrust.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Ce controleur gere la connexion.
 *
 * Points de securite importants (pour ton projet DevSecOps) :
 *  - Le mot de passe attendu n'est JAMAIS stocke en clair : on garde son "hash" BCrypt.
 *  - L'identifiant et le hash viennent de la CONFIGURATION (variables d'environnement),
 *    pas du code en dur. En local ils viennent de application.properties ;
 *    sur AWS ils viendront de Secrets Manager / Parameter Store.
 *  - On ne revele jamais si c'est l'identifiant OU le mot de passe qui est faux
 *    (message d'erreur unique), pour ne pas aider un attaquant.
 */
@RestController
@RequestMapping("/api")
public class LoginController {

    // Identifiant autorise, injecte depuis la configuration.
    @Value("${app.auth.username}")
    private String expectedUsername;

    // Hash BCrypt du mot de passe autorise, injecte depuis la configuration.
    @Value("${app.auth.password-hash}")
    private String expectedPasswordHash;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        boolean usernameOk = expectedUsername.equals(request.getUsername());
        // encoder.matches compare le mot de passe tape au hash stocke,
        // sans jamais avoir besoin de connaitre le mot de passe en clair.
        boolean passwordOk = encoder.matches(request.getPassword(), expectedPasswordHash);

        if (usernameOk && passwordOk) {
            response.put("success", true);
            response.put("message", "Connexion reussie. Bienvenue !");
        } else {
            // Message volontairement vague : on ne dit pas quoi est faux.
            response.put("success", false);
            response.put("message", "Identifiant ou mot de passe incorrect.");
        }
        return response;
    }

    // Petite route de sante, utile pour verifier que le backend tourne
    // (et plus tard pour les health checks AWS).
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> r = new HashMap<>();
        r.put("status", "ok");
        return r;
    }

    // Structure des donnees recues lors du login.
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
