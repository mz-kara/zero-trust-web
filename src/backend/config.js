// config.js — centralise la recuperation des secrets.
//
// Deux modes, selon USE_SECRETS_MANAGER :
//  - "true"  : les secrets viennent d'AWS Secrets Manager (production).
//  - sinon   : les secrets viennent des variables d'environnement (local).
//
// En production, deux secrets separes sont lus :
//   - JWT_SECRET_NAME (defaut: "jwt_secret")   -> la cle JWT
//   - DB_SECRET_NAME  (defaut: "db_password")  -> le mot de passe de la base
// Aucune valeur de secret n'est ecrite en dur dans ce fichier.

async function loadConfig() {
  if (process.env.USE_SECRETS_MANAGER === "true") {
    // --- Production : AWS Secrets Manager (deux secrets separes) ---
    const {
      SecretsManagerClient,
      GetSecretValueCommand,
    } = require("@aws-sdk/client-secrets-manager");

    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "eu-west-3",
    });

    // Petite fonction pour lire un secret et renvoyer sa valeur brute.
    async function readSecret(name) {
      const resp = await client.send(
        new GetSecretValueCommand({ SecretId: name })
      );
      return resp.SecretString;
    }

    const jwtSecretName = process.env.JWT_SECRET_NAME || "jwt_secret";
    const dbSecretName  = process.env.DB_SECRET_NAME  || "db_password";

    // Deux appels : un pour la cle JWT, un pour le mot de passe DB.
    const jwtSecret  = await readSecret(jwtSecretName);
    const dbPassword = await readSecret(dbSecretName);

    return {
      jwtSecret: jwtSecret,
      db: {
        host:     process.env.DB_HOST || "db",
        port:     process.env.DB_PORT || 5432,
        user:     process.env.DB_USER || "coffre",
        password: dbPassword,
        database: process.env.DB_NAME || "coffre",
      },
    };
  }

  // --- Local : variables d'environnement (fournies par docker-compose) ---
  const required = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes : ${missing.join(", ")}. ` +
      `Definis-les (docker-compose) ou active USE_SECRETS_MANAGER=true.`
    );
  }

  return {
    jwtSecret: process.env.JWT_SECRET,
    db: {
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT || 5432,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  };
}

module.exports = { loadConfig };