import fetch from "node-fetch";

const API_KEY = "e407186c781175f4eda383070fef7b89";
const TOKEN = "ATTA78346b1d891c7208078545999724c985575bc696bf078d1624b2dcbcc5d2bf31FE1786C9";
const BOARD_ID = "https://trello.com/b/XyMSKz4a/viabilidade"; // pegue no URL do seu quadro

// Função para ler todos os cards
export async function getCards() {
  const url = `https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${API_KEY}&token=${TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Função para criar um novo card
export async function createCard(listId, name, desc) {
  const url = `https://api.trello.com/1/cards?idList=${listId}&key=${API_KEY}&token=${TOKEN}&name=${encodeURIComponent(name)}&desc=${encodeURIComponent(desc)}`;
  const res = await fetch(url, { method: "POST" });
  return res.json();
}
