require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./src/database/database');
const Log = require('./src/models/Log');
const analyzer = require('./src/middleware/analyzer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware base
app.use(cors());
app.use(express.json());



// Usa l'analyzer su TUTTE le richieste
app.use(analyzer);

// --- ENDPOINT ESCA (HONEYPOT) ---
app.get('/api/admin/config', (req, res) => {
  res.status(401).json({ error: "Unauthorized access detected" });
});

app.post('/wp-login.php', (req, res) => {
  res.status(200).send("Login failed");
});

app.get('/', (req, res) => {
  res.send("Benvenuto nel server sicuro.");
});

// Connetti al database e avvia il server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connessione a PostgreSQL riuscita!');

    // Sincronizza i modelli (crea le tabelle se non esistono)
    await sequelize.sync(); // Crea le tabelle solo se non esistono
    console.log('[DB] Modelli sincronizzati.');

    app.listen(PORT, () => {
      console.log(`[Honeypot-AI] Server attivo sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error('[DB] Errore connessione:', error.message);
    process.exit(1);
  }
};

startServer();