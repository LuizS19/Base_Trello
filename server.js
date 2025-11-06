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

// -------------------------------------------
// GERAR BASE DE DADOS A PARTIR DOS CARDS ARQUIVADOS
// -------------------------------------------
app.get("/base", async (req, res) => {
  const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards/closed?key=${API_KEY}&token=${TOKEN}`;
  const response = await fetch(url);
  const cards = await response.json();

  // Função para extrair dados estruturados da descrição
  const parseInfo = (desc) => {
    const cidadeMatch = desc.match(/Cidade:\s*([A-Za-zÀ-ÿ\s]+)/i);
    const ufMatch = desc.match(/UF:\s*([A-Z]{2})/i);
    const tipoMatch = desc.match(/(link dedicado|banda larga|l2l)/i);
    const valorMatch = desc.match(/R?\$?\s?([\d.,]+)/i);

    return {
      cidade: cidadeMatch ? cidadeMatch[1].trim() : "",
      uf: ufMatch ? ufMatch[1].trim().toUpperCase() : "",
      tipo: tipoMatch ? tipoMatch[1].toUpperCase() : "",
      valor: valorMatch ? valorMatch[1].replace(",", ".") : ""
    };
  };

  // Montar CSV com as informações extraídas
  let csv = "Cidade,UF,Tipo,Valor\n";
  cards.forEach(card => {
    const info = parseInfo(card.desc + " " + card.name); // tenta extrair tanto do nome quanto da descrição
    csv += `"${info.cidade}","${info.uf}","${info.tipo}","${info.valor}"\n`;
  });

  // Resposta em formato CSV para download
  res.setHeader("Content-disposition", "attachment; filename=base_trello.csv");
  res.set("Content-Type", "text/csv");
  res.status(200).send(csv);
});

