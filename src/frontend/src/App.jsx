import { useState } from 'react'

// Adresse du backend. En local c'est localhost:8080.
// Plus tard, on la remplacera par l'URL de production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        setLoggedIn(true)
      } else {
        setMessage(data.message)
      }
    } catch (err) {
      setMessage('Impossible de joindre le serveur. Le backend est-il demarre ?')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setLoggedIn(false)
    setUsername('')
    setPassword('')
    setMessage('')
  }

  // Ecran affiche APRES connexion reussie.
  if (loggedIn) {
    return (
      <div className="card">
        <h1>Zone securisee</h1>
        <p className="success">Tu es connecte.</p>
        <p>Ceci est le contenu protege du site. Pour l'instant il affiche
           juste ce message, mais c'est ici que tu ajouteras ta
           fonctionnalite cybersecurite plus tard.</p>
        <button onClick={handleLogout}>Se deconnecter</button>
      </div>
    )
  }

  // Ecran de connexion.
  return (
    <div className="card">
      <h1>Connexion à votre compte</h1>
      <form onSubmit={handleLogin}>
        <label>
          Identifiant
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {message && <p className="error">{message}</p>}
      <p className="hint">
        Identifiants de test : <strong>admin</strong> / <strong>motdepasse123</strong>
      </p>
    </div>
  )
}
