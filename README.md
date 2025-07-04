# Perfil Bíblico

Um jogo de perguntas e respostas para grupos, baseado em personagens, lugares e acontecimentos da Bíblia. Ideal para dinâmicas em grupos de jovens, escolas dominicais ou encontros familiares.

## Estrutura do Projeto

- `src/html/`: Contém os arquivos de interface (customization.html, game.html, scoreboard.html)
- `src/css/`: Contém o arquivo de estilos (style.css)
- `src/js/`: Contém o arquivo de lógica (script.js)
- `index.html`: Arquivo principal que carrega os parciais HTML e referencia o CSS e JS corretos.
- `heartbeat.mp3` e `buzzer.mp3`: Áudios de feedback (adicione estes arquivos na mesma pasta para funcionamento completo).

## Como Jogar

1. Abra o `index.html` em um navegador moderno.
2. Siga as instruções na tela para personalizar e jogar.

## Observação

O `index.html` carrega os arquivos HTML parciais de `src/html/` e referencia o CSS e JS de `src/css/` e `src/js/` respectivamente. Certifique-se de manter a estrutura de pastas para o funcionamento correto.

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