# ===========================================================================
# Dockerfile du backend Java (Spring Boot)
# ===========================================================================
# On utilise un build "multi-etapes" :
#   Etape 1 : on compile l'application avec Maven.
#   Etape 2 : on garde SEULEMENT le resultat compile dans une image legere.
# Resultat : une image finale petite et sans outils de build inutiles
# (bonne pratique de securite : moins de choses = moins de surface d'attaque).

# --- Etape 1 : compilation ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# On copie d'abord le pom.xml pour profiter du cache Docker sur les dependances
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Puis le code source, et on compile
COPY src ./src
RUN mvn clean package -DskipTests

# --- Etape 2 : image finale, legere ---
FROM eclipse-temurin:17-jre
WORKDIR /app
# On recupere le .jar compile depuis l'etape 1
COPY --from=build /app/target/app-1.0.0.jar app.jar
# Le backend ecoute sur le port 8080
EXPOSE 8080
# Commande de demarrage
ENTRYPOINT ["java", "-jar", "app.jar"]
