# Perfil Bíblico

Um jogo de perguntas e respostas para grupos, baseado em personagens, lugares e acontecimentos da Bíblia. Ideal para dinâmicas em grupos de jovens, escolas dominicais ou encontros familiares.

## Como Jogar

1. **Escolha o número de rodadas** no menu suspenso.
2. Clique em **Começar**.
3. Leia as dicas exibidas e tente adivinhar a resposta correta.
4. Digite sua resposta e clique em **Responder**.
5. O placar é atualizado automaticamente. O jogo alterna entre dois grupos.
6. O tempo para cada rodada é de 60 segundos, com feedback sonoro nos últimos 10 segundos e ao esgotar o tempo.
7. Ao final das rodadas, o jogo exibe o resultado final.

## Estrutura do Projeto

- `index.html`: Interface do usuário.
- `style.css`: Estilos visuais.
- `script.js`: Lógica do jogo (cartas, dicas, placar, temporizador).
- `heartbeat.mp3` e `buzzer.mp3`: Áudios de feedback (adicione estes arquivos na mesma pasta para funcionamento completo).

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, etc.).
- Não requer backend ou instalação de dependências.

## Personalização

Para adicionar novas cartas:
1. Abra o arquivo `script.js`.
2. Adicione novos objetos ao array `cards`, seguindo o formato:
   ```js
   {
     category: "Pessoa" | "Lugar" | "Acontecimento",
     answer: "Resposta",
     hints: ["Dica 1", "Dica 2", ...]
   }
   ```

## Licença

Uso livre para fins educacionais e recreativos.

---

### Observações

- Certifique-se de adicionar os arquivos de áudio (`heartbeat.mp3` e `buzzer.mp3`) na raiz do projeto para o feedback sonoro funcionar corretamente.
- O jogo pode ser facilmente expandido com mais cartas e categorias.

---

## Sugestões de Melhoria

- Separar os dados das cartas em um arquivo externo (ex: `cards.json`).
- Modularizar o JavaScript, criando funções menores e separando responsabilidades.
- Adicionar testes automatizados para as funções principais.
- Implementar um modo de administração para adicionar cartas via interface.
- Melhorar a responsividade e acessibilidade da interface. 