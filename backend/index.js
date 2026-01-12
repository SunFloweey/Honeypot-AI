const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

// Usa app.use() invece di app.all("*") o app.all("/*")
app.use((req, res) => {
  const log = `${new Date().toISOString()} | ${req.ip} | ${req.method} ${req.url}\n`;
  fs.appendFileSync("honeypot.log", log);
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Backend Node honeypot attivo su http://localhost:3002");
});
