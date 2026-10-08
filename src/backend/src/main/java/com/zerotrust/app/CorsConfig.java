package com.zerotrust.app;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Autorise le frontend React (qui tourne sur un autre port en local)
 * a appeler l'API du backend. Sans ca, le navigateur bloque les requetes
 * pour raison de securite (regle "same-origin").
 *
 * En local : le frontend est sur http://localhost:5173 (Vite).
 * Plus tard en production, on restreindra a ton vrai domaine.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://localhost:8081"
                )
                .allowedMethods("GET", "POST")
                .allowedHeaders("*");
    }
}
