// server.js — API du coffre de notes securisees.
//
// Routes :
//   POST /api/register      -> creer un compte
//   POST /api/login         -> se connecter, renvoie un token JWT
//   GET  /api/notes         -> lister mes notes (protege)
//   POST /api/notes         -> ajouter une note (protege)
//   DELETE /api/notes/:id   -> supprimer une note (protege)
//   GET  /api/health        -> verification de sante (pour le DAST / monitoring)

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { loadConfig } = require("./config");

async function main() {
  // Charge la configuration (secrets inclus) avant tout.
  const config = await loadConfig();

  // Pool Postgres construit a partir de la config.
  const pool = new Pool(config.db);

  // Cree les tables si besoin.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- Middleware d'authentification : verifie le token JWT ---
  function auth(req, res, next) {
    const header = req.headers["authorization"] || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.userId = payload.userId;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Token invalide" });
    }
  }

  // --- Sante ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Inscription ---
  app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username et password requis" });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
        [username, hash]
      );
      res.status(201).json({ message: "Compte cree" });
    } catch (e) {
      if (e.code === "23505") {
        return res.status(409).json({ error: "Nom d'utilisateur deja pris" });
      }
      console.error(e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // --- Connexion ---
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username et password requis" });
    }
    try {
      const result = await pool.query(
        "SELECT id, password_hash FROM users WHERE username = $1",
        [username]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }
      const user = result.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }
      // Genere un token signe avec la cle secrete (celle de Secrets Manager en prod).
      const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: "1h",
      });
      res.json({ token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // --- Lister mes notes ---
  app.get("/api/notes", auth, async (req, res) => {
    const result = await pool.query(
      "SELECT id, content, created_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  });

  // --- Ajouter une note ---
  app.post("/api/notes", auth, async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content requis" });
    }
    const result = await pool.query(
      "INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING id, content, created_at",
      [req.userId, content]
    );
    res.status(201).json(result.rows[0]);
  });

  // --- Supprimer une note ---
  app.delete("/api/notes/:id", auth, async (req, res) => {
    await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Note supprimee" });
  });

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Backend coffre-notes sur le port ${port}`);
  });
}

main().catch((e) => {
  console.error("Echec demarrage :", e);
  process.exit(1);
});
