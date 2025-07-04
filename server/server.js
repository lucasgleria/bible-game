// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 4000;
const LEADERBOARD_PATH = path.join(__dirname, 'leaderboard.json');

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..')));

// Rotas para leaderboard
app.get('/leaderboard', (req, res) => {
  fs.readFile(LEADERBOARD_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler leaderboard.' });
    let arr = [];
    try { arr = JSON.parse(data); } catch (e) {}
    arr.sort((a, b) => b.pontos - a.pontos || b.acertos - a.acertos);
    res.json(arr.slice(0, 10));
  });
});

app.post('/leaderboard', (req, res) => {
  const newResult = req.body;
  fs.readFile(LEADERBOARD_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler leaderboard.' });
    let leaderboard = [];
    try {
      leaderboard = JSON.parse(data);
    } catch (e) {}
    leaderboard.push(newResult);
    fs.writeFile(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar leaderboard.' });
      res.json({ success: true });
    });
  });
});

// --- Lógica de Salas e Multiplayer ---

// Estrutura para armazenar salas e seus estados
const salas = {};
const salaTimeouts = {};

function gerarCodigoSala() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// Função utilitária para embaralhar array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Cartas do jogo (pode ser expandido)
const cartas = [
  {
    categoria: "Pessoa",
    resposta: "Moisés",
    dicas: [
      "Fui colocado num cesto no rio quando bebê.",
      "Fui chamado por Deus numa sarça ardente.",
      "Lidereio o povo na travessia do Mar Vermelho.",
      "Recebi as tábuas da Lei.",
      "Meu nome começa com M."
    ]
  },
  {
    categoria: "Lugar",
    resposta: "Jerusalém",
    dicas: [
      "Cidade onde o templo foi construído.",
      "Local do ministério e morte de Jesus.",
      "Cidade santa para judeus e cristãos.",
      "Davi foi o rei aqui.",
      "Meu nome começa com J."
    ]
  },
  {
    categoria: "Acontecimento",
    resposta: "Dilúvio",
    dicas: [
      "Teve duração de 40 dias e 40 noites.",
      "Foi anunciado por Deus a Noé.",
      "Uma arca foi construída.",
      "Todos os seres vivos foram salvos em pares.",
      "Meu nome começa com D."
    ]
  }
];

// Função para salvar resultado no leaderboard
function salvarResultadoLeaderboard(grupo, pontos, acertos) {
  const fs = require('fs');
  const path = require('path');
  const LEADERBOARD_PATH = path.join(__dirname, 'leaderboard.json');
  const novoRegistro = { grupo, pontos, acertos, data: new Date().toISOString() };
  fs.readFile(LEADERBOARD_PATH, 'utf8', (err, data) => {
    let leaderboard = [];
    if (!err && data) {
      try {
        leaderboard = JSON.parse(data);
      } catch (e) { leaderboard = []; }
    }
    leaderboard.push(novoRegistro);
    fs.writeFile(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2), err => {
      if (err) {
        console.error('[ERRO] Falha ao salvar leaderboard:', err);
      }
    });
  });
}

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // --- CRIAÇÃO DE SALA ---
  socket.on('criarSala', ({ nomeGrupo, groupUUID }, callback) => {
    let codigo;
    do {
      codigo = gerarCodigoSala();
    } while (salas[codigo]);
    salas[codigo] = {
      grupos: [],
      estado: 'customizacao',
      rodada: 0,
      jogo: null
    };
    // Remove apenas o grupo antigo com o mesmo groupUUID
    if (groupUUID) {
      salas[codigo].grupos = salas[codigo].grupos.filter(g => g.groupUUID !== groupUUID);
    }
    salas[codigo].grupos.push({ id: socket.id, nome: nomeGrupo, pronto: false, groupUUID });
    socket.join(codigo);
    socket.sala = codigo;
    console.log(`[LOG] Sala criada: ${codigo} por ${nomeGrupo} (socket: ${socket.id})`);
    callback({ sucesso: true, codigo });
    console.log(`[LOG] Estado da sala ${codigo} após criação:`, JSON.stringify(salas[codigo]));
  });

  // --- ENTRADA EM SALA ---
  socket.on('entrarSala', ({ codigo, nomeGrupo, groupUUID }, callback) => {
    const sala = salas[codigo];
    if (!sala) return callback({ sucesso: false, mensagem: 'Sala não encontrada.' });
    // Se já existe um grupo com o mesmo groupUUID, atualize o id e nome, não adicione novo grupo
    let grupoExistente = null;
    if (groupUUID) {
      grupoExistente = sala.grupos.find(g => g.groupUUID === groupUUID);
      if (grupoExistente) {
        grupoExistente.id = socket.id;
        grupoExistente.nome = nomeGrupo;
        grupoExistente.pronto = false; // Ao reconectar, volta a não estar pronto
        socket.join(codigo);
        socket.sala = codigo;
        // Cancelar timeout de remoção se alguém reconectar
        if (salaTimeouts[codigo]) {
          clearTimeout(salaTimeouts[codigo]);
          delete salaTimeouts[codigo];
          console.log(`Timeout de remoção da sala ${codigo} cancelado por reconexão.`);
        }
        console.log(`[LOG] ${nomeGrupo} reconectou na sala ${codigo} (socket: ${socket.id})`);
        callback({ sucesso: true, codigo });
        io.to(codigo).emit('atualizarSala', { grupos: sala.grupos });
        console.log(`[LOG] Estado da sala ${codigo} após reconexão:`, JSON.stringify(salas[codigo]));
        return;
      }
      // Se não existe, remove qualquer grupo antigo com o mesmo groupUUID (garantia extra)
      sala.grupos = sala.grupos.filter(g => g.groupUUID !== groupUUID);
    }
    if (sala.grupos.length >= 2) return callback({ sucesso: false, mensagem: 'Sala cheia.' });
    sala.grupos.push({ id: socket.id, nome: nomeGrupo, pronto: false, groupUUID });
    socket.join(codigo);
    socket.sala = codigo;
    // Cancelar timeout de remoção se alguém reconectar
    if (salaTimeouts[codigo]) {
      clearTimeout(salaTimeouts[codigo]);
      delete salaTimeouts[codigo];
      console.log(`Timeout de remoção da sala ${codigo} cancelado por reconexão.`);
    }
    console.log(`[LOG] ${nomeGrupo} entrou na sala ${codigo} (socket: ${socket.id})`);
    callback({ sucesso: true, codigo });
    io.to(codigo).emit('atualizarSala', { grupos: sala.grupos });
    console.log(`[LOG] Estado da sala ${codigo} após entrada:`, JSON.stringify(salas[codigo]));
  });

  // Evento para configurar a sala (apenas pelo criador, uma vez)
  socket.on('configurarSala', ({ codigo, configuracoes }, callback) => {
    const sala = salas[codigo];
    if (!sala) return callback && callback({ sucesso: false, mensagem: 'Sala não encontrada.' });
    if (sala.configurado) return callback && callback({ sucesso: false, mensagem: 'Sala já configurada.' });
    sala.configuracoes = configuracoes;
    sala.configurado = true;
    console.log(`[LOG] Sala ${codigo} configurada:`, configuracoes);
    callback && callback({ sucesso: true });
  });

  // Marcar grupo como pronto
  socket.on('grupoPronto', () => {
    const codigo = socket.sala;
    const sala = salas[codigo];
    if (!sala) return;
    const grupo = sala.grupos.find(g => g.id === socket.id);
    if (grupo) grupo.pronto = true;
    io.to(codigo).emit('atualizarSala', { grupos: sala.grupos });
  
    const todosProntos = sala.grupos.length === 2 && sala.grupos.every(g => g.pronto);
    if (todosProntos) {
      sala.estado = 'jogo';
      sala.rodada = 1;
      sala.turno = 0;
      sala.pontuacao = [0, 0];
      sala.acertos = [0, 0];
      sala.maxRodadas = (sala.configuracoes && sala.configuracoes.maxRodadas) ? sala.configuracoes.maxRodadas : 5;
      sala.cartasRestantes = [...cartas];
      shuffle(sala.cartasRestantes);
      sala.cartaAtual = sala.cartasRestantes.pop();
      sala.dicaAtual = 1;
      sala.respondeu = false;
  
      const estadoInicial = {
        rodada: sala.rodada,
        maxRodadas: sala.maxRodadas,
        turno: sala.turno,
        carta: {
          categoria: sala.cartaAtual.categoria,
          dicas: sala.cartaAtual.dicas.slice(0, sala.dicaAtual)
        },
        pontuacao: sala.pontuacao,
        acertos: sala.acertos,
        grupos: sala.grupos
      };
  
      io.to(codigo).emit('iniciarJogo', estadoInicial);
  
      setTimeout(() => {
        enviarEstadoJogo(codigo);
      }, 1000);
    }
  });
  
  // Grupo pede dica extra
  socket.on('pedirDica', () => {
    const codigo = socket.sala;
    const sala = salas[codigo];
    if (!sala || sala.estado !== 'jogo') return;
    if (sala.dicaAtual < sala.cartaAtual.dicas.length) {
      sala.dicaAtual++;
      enviarEstadoJogo(codigo);
    }
  });

  // Grupo envia resposta
  socket.on('responder', (resposta) => {
    const codigo = socket.sala;
    const sala = salas[codigo];
    if (!sala || sala.estado !== 'jogo' || sala.respondeu) return;
    const turno = sala.turno;
    if (resposta.trim().toLowerCase() === sala.cartaAtual.resposta.toLowerCase()) {
      // Pontuação por dica
      const pontosPorDica = [10, 8, 5, 3, 1];
      const pontos = pontosPorDica[sala.dicaAtual - 1] || 1;
      sala.pontuacao[turno] += pontos;
      sala.acertos[turno] += 1;
      sala.respondeu = true;
      io.to(codigo).emit('feedback', { tipo: 'acerto', pontos });
    } else {
      io.to(socket.id).emit('feedback', { tipo: 'erro' });
      return;
    }
    setTimeout(() => {
      proximaRodada(codigo);
    }, 1200);
  });

  function proximaRodada(codigo) {
    const sala = salas[codigo];
    if (!sala) return;
    sala.rodada++;
    sala.turno = 1 - sala.turno;
    sala.dicaAtual = 1;
    sala.respondeu = false;
    if (sala.rodada > sala.maxRodadas || sala.cartasRestantes.length === 0) {
      sala.estado = 'fim';
      io.to(codigo).emit('fimJogo', {
        pontuacao: sala.pontuacao,
        acertos: sala.acertos,
        grupos: sala.grupos.map(g => g.nome)
      });
      // Salvar resultado dos dois grupos
      salvarResultadoLeaderboard(sala.grupos[0].nome, sala.pontuacao[0], sala.acertos[0]);
      salvarResultadoLeaderboard(sala.grupos[1].nome, sala.pontuacao[1], sala.acertos[1]);
      return;
    }
    sala.cartaAtual = sala.cartasRestantes.pop();
    enviarEstadoJogo(codigo);
  }

  function enviarEstadoJogo(codigo) {
    const sala = salas[codigo];
    if (!sala) return;
    const estado = {
      rodada: sala.rodada,
      maxRodadas: sala.maxRodadas,
      turno: sala.turno,
      carta: {
        categoria: sala.cartaAtual.categoria,
        dicas: sala.cartaAtual.dicas.slice(0, sala.dicaAtual)
      },
      pontuacao: sala.pontuacao,
      acertos: sala.acertos,
      grupos: sala.grupos // Mude esta linha para enviar o array de objetos de grupo completo
    };
    console.log('[DEBUG BACKEND] Estado enviado para os clientes:', JSON.stringify(estado));
    io.to(codigo).emit('atualizarJogo', estado);
  }

  // Evento para fornecer o estado atual da sala para um socket
  socket.on('pedirEstadoSala', (codigo, callback) => {
    const sala = salas[codigo];
    if (!sala || sala.estado !== 'jogo') return callback && callback(null);
    callback && callback({
      rodada: sala.rodada,
      maxRodadas: sala.maxRodadas,
      turno: sala.turno,
      carta: {
        categoria: sala.cartaAtual.categoria,
        dicas: sala.cartaAtual.dicas.slice(0, sala.dicaAtual)
      },
      pontuacao: sala.pontuacao,
      acertos: sala.acertos,
      grupos: sala.grupos
    });
  });

  // --- DESCONEXÃO ---
  socket.on('disconnect', () => {
    const codigo = socket.sala;
    if (!codigo || !salas[codigo]) return;
    const sala = salas[codigo];
    // Remove apenas o grupo do socket desconectado
    sala.grupos = sala.grupos.filter(g => g.id !== socket.id);
    if (sala.grupos.length === 0) {
      // Inicia timeout para remoção da sala
      if (salaTimeouts[codigo]) clearTimeout(salaTimeouts[codigo]);
      salaTimeouts[codigo] = setTimeout(() => {
        delete salas[codigo];
        delete salaTimeouts[codigo];
        console.log(`Sala ${codigo} removida (timeout atingido).`);
      }, 2 * 60 * 1000); // 2 minutos
      console.log(`Sala ${codigo} ficará reservada por 2 minutos para reconexão.`);
    } else {
      io.to(codigo).emit('atualizarSala', { grupos: sala.grupos });
      console.log(`Grupo saiu da sala ${codigo}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 