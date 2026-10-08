# Zero Trust App — application de login (backend Java + frontend React)

Petite application avec une page de connexion. Une fois connecte, l'utilisateur
voit une "zone securisee". C'est le socle applicatif de ton projet DevSecOps :
le code est volontairement simple, l'interet est ce que tu vas construire
**autour** (secrets manages, infra Terraform, HTTPS, CI/CD).

## Ce qu'il y a dedans

```
zero-trust-app/
├── backend/          # API Java (Spring Boot) : verifie l'identifiant/mot de passe
├── frontend/         # Interface React : formulaire de connexion
├── docker-compose.yml# Lance les deux ensemble avec Docker
└── README.md
```

## Identifiants de test

- Identifiant : `admin`
- Mot de passe : `motdepasse123`

Le mot de passe n'est **pas** stocke en clair : le backend ne connait que son
empreinte (hash BCrypt). C'est un point de securite important a mettre en avant
dans ton projet.

---

## Comment lancer — 2 methodes

### Methode A : avec Docker (la plus simple, recommandee)

Prerequis : Docker installe.

```bash
cd zero-trust-app
docker compose up --build
```

Puis ouvre ton navigateur :
- Frontend (le site) : http://localhost:8081
- Backend (l'API) : http://localhost:8080/api/health  (doit afficher {"status":"ok"})

Pour arreter : Ctrl+C, puis `docker compose down`.

### Methode B : sans Docker (pour developper)

Tu as besoin de deux terminaux.

**Terminal 1 — backend** (necessite Java 17+ et Maven) :
```bash
cd zero-trust-app/backend
mvn spring-boot:run
```
Le backend demarre sur http://localhost:8080

**Terminal 2 — frontend** (necessite Node.js 18+) :
```bash
cd zero-trust-app/frontend
npm install
npm run dev
```
Le frontend demarre sur http://localhost:5173

Ouvre http://localhost:5173 et connecte-toi.

---

## Comment tester que ca marche

1. Va sur la page → tu vois le formulaire de connexion.
2. Entre `admin` / `motdepasse123` → tu arrives sur la "zone securisee".
3. Entre un mauvais mot de passe → message d'erreur (volontairement vague).

Tu peux aussi tester l'API directement :
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"motdepasse123"}'
```
Reponse attendue : `{"success":true,"message":"Connexion reussie. Bienvenue !"}`

---

## Notes de securite (pour ton projet DevSecOps)

Ce qui est deja bien fait :
- Mot de passe stocke sous forme de **hash BCrypt**, jamais en clair.
- Identifiant et hash lisibles depuis des **variables d'environnement**
  (donc injectables depuis Secrets Manager plus tard, sans les mettre dans le code).
- Message d'erreur unique (on ne dit pas si c'est l'identifiant ou le mot de
  passe qui est faux).
- CORS restreint (le backend n'accepte que le frontend, pas n'importe qui).

Ameliorations a documenter comme "prochaines etapes" :
- Limiter le nombre de tentatives (anti brute-force).
- Sessions / jetons (JWT) pour maintenir la connexion.
- Vraie base de donnees pour plusieurs utilisateurs.
- HTTPS (via Certbot ou un load balancer + ACM).
- Faire venir les secrets de AWS Secrets Manager au demarrage.

---

## Comment changer les identifiants

Le mot de passe est defini par son hash BCrypt. Pour en generer un nouveau,
avec Python :

```bash
pip install bcrypt
python3 -c "import bcrypt; print(bcrypt.hashpw(b'TON_NOUVEAU_MDP', bcrypt.gensalt(rounds=10)).decode())"
```

Copie le hash obtenu et mets-le :
- soit dans `backend/src/main/resources/application.properties`
  (ligne `app.auth.password-hash=...`),
- soit dans la variable d'environnement `APP_AUTH_PASSWORD_HASH`
  (c'est ce qu'on fera sur AWS).
