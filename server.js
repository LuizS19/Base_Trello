// -------------------------------------------
// IMPORTAÇÕES
// -------------------------------------------
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { writeFileSync } from "fs";

// -------------------------------------------
// CONFIGURAÇÕES BÁSICAS DO SERVIDOR
// -------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(__dirname));

// -------------------------------------------
// CONFIGURAÇÕES DA API DO TRELLO
// -------------------------------------------
// ⚠️ Substitua pelos seus dados
const API_KEY = "SUA_API_KEY_AQUI";
const TOKEN = "SEU_TOKEN_AQUI";
const BOARD_ID = "SEU_BOARD_ID_AQUI";

// -------------------------------------------
// FUNÇÕES DE INTEGRAÇÃO COM A API DO TRELLO
// -------------------------------------------

// Buscar todos os cards
async function getCards() {
  const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${API_KEY}&token=${TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Criar um novo card
async function createCard(listId, name, desc) {
  const url = `https://api.trello.com/1/cards?idList=${listId}&key=${API_KEY}&token=${TOKEN}&name=${encodeURIComponent(name)}&desc=${encodeURIComponent(desc)}`;
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  return data;
}

// -------------------------------------------
// ROTAS DO SERVIDOR
// -------------------------------------------

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota para listar todos os cards
app.get("/cards", async (req, res) => {
  const cards = await getCards();
  res.json(cards);
});

// Rota para criar um novo card de teste
app.get("/add", async (req, res) => {
  const listId = "ID_DA_LISTA_AQUI"; // substitua pelo ID da lista onde quer criar
  const novo = await createCard(listId, "Card de Teste", "Criado via API Node.js");
  res.json(novo);
});

// Rota para exportar todos os cards como CSV
app.get("/export", async (req, res) => {
  const cards = await getCards();
  let csv = "Nome,Descrição,Data\n";
  cards.forEach(c => {
    csv += `"${c.name}","${c.desc.replace(/\n/g, " ")}","${c.dateLastActivity}"\n`;
  });

  // Enviar o CSV para download direto
  res.setHeader("Content-disposition", "attachment; filename=cards.csv");
  res.set("Content-Type", "text/csv");
  res.status(200).send(csv);
});

// Rota para gerar base de dados a partir dos cards arquivados
app.get("/base", async (req, res) => {
  const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards/closed?key=${API_KEY}&token=${TOKEN}`;
  const response = await fetch(url);
  const cards = await response.json();

  // Função para extrair dados da descrição
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

  // Montar o CSV com as informações extraídas
  let csv = "Cidade,UF,Tipo,Valor\n";
  cards.forEach(card => {
    const info = parseInfo(card.desc + " " + card.name);
    csv += `"${info.cidade}","${info.uf}","${info.tipo}","${info.valor}"\n`;
  });

  // Enviar o CSV para download
  res.setHeader("Content-disposition", "attachment; filename=base_trello.csv");
  res.set("Content-Type", "text/csv");
  res.status(200).send(csv);
});

// -------------------------------------------
// INICIAR SERVIDOR
// -------------------------------------------
app.listen(3000, () => console.log("✅ Servidor rodando e pronto!"));
