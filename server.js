import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => console.log("Servidor rodando"));

import { getCards, createCard } from "./trello.js";

// Rota para listar todos os cards
app.get("/cards", async (req, res) => {
  const cards = await getCards();
  res.json(cards);
});

// Rota para criar um card de teste
app.get("/add", async (req, res) => {
  const novo = await createCard("ID_DA_LISTA_AQUI", "Card de Teste", "Criado via API");
  res.json(novo);
});

import { getCards } from "./trello.js";
import { writeFileSync } from "fs";

app.get("/export", async (req, res) => {
  const cards = await getCards();
  let csv = "Nome,Descrição,Data\n";
  cards.forEach(c => {
    csv += `"${c.name}","${c.desc.replace(/\n/g, " ")}","${c.dateLastActivity}"\n`;
  });
  writeFileSync("cards.csv", csv);
  res.send("✅ Arquivo CSV gerado com sucesso!");
});

