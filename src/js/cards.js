// cards.js
// Responsável por carregar e fornecer os dados das cartas

export async function loadCards() {
  const response = await fetch('/src/js/cards.json');
  if (!response.ok) throw new Error('Erro ao carregar cartas');
  return await response.json();
} 