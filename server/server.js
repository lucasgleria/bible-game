// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 4001;
const LEADERBOARD_PATH = path.join(__dirname, 'leaderboard.json');

// Middleware CORS para permitir requisições do frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..')));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..')));

// Rotas para leaderboard
app.get('/leaderboard', (req, res) => {
  console.log('[LEADERBOARD] Requisição GET /leaderboard recebida');
  fs.readFile(LEADERBOARD_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('[LEADERBOARD] Erro ao ler arquivo:', err);
      return res.status(500).json({ error: 'Erro ao ler leaderboard.' });
    }
    let arr = [];
    try { 
      arr = JSON.parse(data); 
      console.log('[LEADERBOARD] Dados carregados:', arr.length, 'registros');
    } catch (e) {
      console.error('[LEADERBOARD] Erro ao parsear JSON:', e);
    }
    arr.sort((a, b) => b.pontos - a.pontos || b.acertos - a.acertos);
    const top10 = arr.slice(0, 10);
    console.log('[LEADERBOARD] Enviando top 10:', top10.length, 'registros');
    res.json(top10);
  });
});

app.post('/leaderboard', (req, res) => {
  const newResult = req.body;
  
  // Validar dados recebidos
  if (!newResult.grupo || typeof newResult.pontos !== 'number' || typeof newResult.acertos !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos para leaderboard.' });
  }
  
  // Usar a função unificada para salvar
  salvarResultadoLeaderboard(newResult.grupo, newResult.pontos, newResult.acertos);
      res.json({ success: true });
});

// --- Lógica de Salas e Multiplayer ---

// Estrutura para armazenar salas e seus estados
const salas = {};
const salaTimeouts = {};
const gameTimers = {}; // Timers de jogo por sala

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

// ---- ANTEÇÃO AQUI ---- 
// Carregar cartas do arquivo JSON
let cartas = [];

// Função para carregar cartas do arquivo
function carregarCartas() {
  const fs = require('fs');
  const path = require('path');
  const cardsPath = path.join(__dirname, '../src/js/cards.json');
  
  try {
    const data = fs.readFileSync(cardsPath, 'utf8');
    const cardsData = JSON.parse(data);
    
    // Converter formato do cards.json para o formato usado no backend
    cartas = cardsData.map(card => ({
      categoria: card.category,
      resposta: card.answer,
      dicas: card.hints
    }));
    
    console.log(`[CARDS] ${cartas.length} cartas carregadas com sucesso`);
  } catch (error) {
    console.error('[CARDS] Erro ao carregar cartas:', error);
    
    // Fallback para cartas hardcoded em caso de erro
    cartas = [
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
    console.log('[CARDS] Usando cartas fallback');
  }
}

// Carregar cartas na inicialização
carregarCartas();

// Variável para controlar acesso concorrente ao leaderboard
let leaderboardLock = false;

// Função para limpar o lock em caso de erro
function clearLeaderboardLock() {
  leaderboardLock = false;
}

// Função para salvar resultado no leaderboard
// Usa um lock simples para evitar condições de corrida e corrupção do arquivo
function salvarResultadoLeaderboard(grupo, pontos, acertos) {
  const fs = require('fs');
  const path = require('path');
  const LEADERBOARD_PATH = path.join(__dirname, 'leaderboard.json');
  const novoRegistro = { grupo, pontos, acertos, data: new Date().toISOString() };
  
  // Se já está sendo escrito, aguardar
  if (leaderboardLock) {
    setTimeout(() => salvarResultadoLeaderboard(grupo, pontos, acertos), 100);
    return;
  }
  
  leaderboardLock = true;
  
  fs.readFile(LEADERBOARD_PATH, 'utf8', (err, data) => {
    let leaderboard = [];
    if (!err && data) {
      try {
        leaderboard = JSON.parse(data);
      } catch (e) { 
        console.error('[LEADERBOARD] Erro ao parsear JSON existente:', e);
        leaderboard = []; 
      }
    }
    leaderboard.push(novoRegistro);
    fs.writeFile(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2), err => {
      if (err) {
        console.error('[ERRO] Falha ao salvar leaderboard:', err);
        clearLeaderboardLock();
      } else {
        console.log('[LEADERBOARD] Resultado salvo:', novoRegistro);
        leaderboardLock = false;
      }
    });
  });
}

// Funções para gerenciar timer do jogo
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
    grupos: sala.grupos,
    timer: {
      tempo: sala.tempoRestante || 60,
      maxTempo: 60,
      ativo: sala.timerAtivo || false
    }
  };
  console.log('[DEBUG BACKEND] Estado enviado para os clientes:', JSON.stringify(estado));
  io.to(codigo).emit('atualizarJogo', estado);
}

function proximaRodada(codigo) {
  const sala = salas[codigo];
  if (!sala) return;
  
  // Verificar se ambos os grupos já jogaram nesta rodada
  if (sala.turno === 1) {
    // Ambos os grupos já jogaram, passar para próxima rodada
  sala.rodada++;
    sala.turno = 0; // Voltar para o primeiro grupo
  sala.dicaAtual = 1;
  sala.respondeu = false;
  
  // Parar timer anterior
  pararTimerJogo(codigo);
  
  if (sala.rodada > sala.maxRodadas || sala.cartasRestantes.length === 0) {
    sala.estado = 'fim';
    pararTimerJogo(codigo); // Garantir que o timer seja parado
    
    // Determinar o vencedor
    const pontuacao1 = sala.pontuacao[0];
    const pontuacao2 = sala.pontuacao[1];
    const vencedor = pontuacao1 > pontuacao2 ? 0 : pontuacao1 < pontuacao2 ? 1 : -1; // -1 = empate
    
    // Enviar som de vitória apenas para o vencedor (se houver)
    if (vencedor !== -1) {
      const vencedorSocket = sala.grupos[vencedor].id;
      const perdedorSocket = sala.grupos[1 - vencedor].id;
      
      // Som de vitória para o vencedor
      io.to(vencedorSocket).emit('audioEvent', { tipo: 'victory', acao: 'play' });
      console.log(`[VICTORY] Som de vitória enviado para ${sala.grupos[vencedor].nome}`);
      
      // Som de derrota para o perdedor
      io.to(perdedorSocket).emit('audioEvent', { tipo: 'lost', acao: 'play' });
      console.log(`[LOST] Som de derrota enviado para ${sala.grupos[1 - vencedor].nome}`);
    }
    
    io.to(codigo).emit('fimJogo', {
      pontuacao: sala.pontuacao,
      acertos: sala.acertos,
      grupos: sala.grupos.map(g => g.nome),
      vencedor: vencedor // -1 = empate, 0 = grupo 1, 1 = grupo 2
    });
    
    // Salvar resultado dos dois grupos
    salvarResultadoLeaderboard(sala.grupos[0].nome, sala.pontuacao[0], sala.acertos[0]);
    salvarResultadoLeaderboard(sala.grupos[1].nome, sala.pontuacao[1], sala.acertos[1]);
    return;
  }
  
    // Nova rodada - pegar nova carta
  sala.cartaAtual = sala.cartasRestantes.pop();
  enviarEstadoJogo(codigo);
  
  // Iniciar timer para nova rodada
  setTimeout(() => {
    iniciarTimerJogo(codigo);
  }, 1000);
  } else {
    // Apenas passar para o próximo grupo na mesma rodada
    sala.turno = 1;
    sala.dicaAtual = 1;
    sala.respondeu = false;
    
    // Parar timer anterior
    pararTimerJogo(codigo);
    
    // Pegar nova carta para o próximo grupo
    sala.cartaAtual = sala.cartasRestantes.pop();
    enviarEstadoJogo(codigo);
    
    // Iniciar timer para o próximo grupo
    setTimeout(() => {
      iniciarTimerJogo(codigo);
    }, 1000);
  }
}

function iniciarTimerJogo(codigo) {
  const sala = salas[codigo];
  if (!sala || sala.estado !== 'jogo') return;
  
  // Limpar timer anterior se existir
  if (gameTimers[codigo]) {
    clearInterval(gameTimers[codigo]);
  }
  
  sala.tempoRestante = 30;
  sala.timerAtivo = true;
  
  // Enviar tempo inicial
  io.to(codigo).emit('atualizarTimer', { tempo: sala.tempoRestante, maxTempo: 30 });
  
  gameTimers[codigo] = setInterval(() => {
    if (!sala || sala.estado !== 'jogo' || !sala.timerAtivo) {
      clearInterval(gameTimers[codigo]);
      delete gameTimers[codigo];
      return;
    }
    
    sala.tempoRestante--;
    
    // Enviar atualização do timer para todos os clientes
    io.to(codigo).emit('atualizarTimer', { tempo: sala.tempoRestante, maxTempo: 30 });
    
    // Evento de áudio: heartbeat nos últimos 11 segundos
    if (sala.tempoRestante === 11) {
      io.to(codigo).emit('audioEvent', { tipo: 'heartbeat', acao: 'play' });
    }
    
    // Verificar se o tempo acabou
    if (sala.tempoRestante <= 0) {
      clearInterval(gameTimers[codigo]);
      delete gameTimers[codigo];
      sala.timerAtivo = false;
      
      // Evento de áudio: buzzer quando tempo esgota
      io.to(codigo).emit('audioEvent', { tipo: 'buzzer', acao: 'play' });
      
      // Tempo esgotado - passar para próximo grupo ou próxima rodada
      io.to(codigo).emit('tempoEsgotado', { 
        resposta: sala.cartaAtual.resposta,
        turnoAnterior: sala.turno,
        proximoTurno: sala.turno === 0 ? 1 : 0
      });
      
      // Aguardar 2 segundos para mostrar feedback, depois passar para próximo grupo/rodada
      setTimeout(() => {
        proximaRodada(codigo);
      }, 2000);
    }
  }, 1000);
}

function proximaPergunta(codigo) {
  const sala = salas[codigo];
  if (!sala || sala.estado !== 'jogo') return;
  
  // Verificar se ainda há cartas disponíveis
  if (sala.cartasRestantes.length === 0) {
    // Não há mais cartas, finalizar turno
    proximaRodada(codigo);
    return;
  }
  
  // Pegar nova carta
  sala.cartaAtual = sala.cartasRestantes.pop();
  sala.dicaAtual = 1;
  
  // Enviar nova pergunta (timer continua rodando)
  enviarEstadoJogo(codigo);
}

function pararTimerJogo(codigo) {
  const sala = salas[codigo];
  if (sala) {
    sala.timerAtivo = false;
  }
  
  if (gameTimers[codigo]) {
    clearInterval(gameTimers[codigo]);
    delete gameTimers[codigo];
  }
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
    console.log('[DEBUG][entrarSala] Parâmetros recebidos:', { codigo, nomeGrupo, groupUUID });
    if (!sala) return callback({ sucesso: false, mensagem: 'Sala não encontrada.' });
    // Se já existe um grupo com o mesmo groupUUID, reativa se estiver desconectado
    let grupoExistente = null;
    if (groupUUID) {
      grupoExistente = sala.grupos.find(g => g.groupUUID === groupUUID);
      console.log('[DEBUG][entrarSala] Grupos atuais na sala:', sala.grupos.map(g => ({ nome: g.nome, groupUUID: g.groupUUID, id: g.id, desconectado: g.desconectado })));
      if (grupoExistente) {
        console.log('[DEBUG][entrarSala] Grupo existente encontrado para groupUUID:', groupUUID, '| grupo:', grupoExistente);
        grupoExistente.id = socket.id;
        grupoExistente.nome = nomeGrupo;
        grupoExistente.pronto = false;
        grupoExistente.desconectado = false;
        socket.join(codigo);
        socket.sala = codigo;
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
    sala.grupos.push({ id: socket.id, nome: nomeGrupo, pronto: false, groupUUID, desconectado: false });
    console.log('[DEBUG][entrarSala] Novo grupo adicionado:', { id: socket.id, nome: nomeGrupo, pronto: false, groupUUID });
    socket.join(codigo);
    socket.sala = codigo;
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
  // socket.on('grupoPronto', () => {
  //   const codigo = socket.sala;
  //   const sala = salas[codigo];
  //   if (!sala) return;
  //   const grupo = sala.grupos.find(g => g.id === socket.id);
  //   if (grupo) grupo.pronto = true;
  //   io.to(codigo).emit('atualizarSala', { grupos: sala.grupos });
  
  //   const todosProntos = sala.grupos.length === 2 && sala.grupos.every(g => g.pronto);
  //   if (todosProntos) {
  //     sala.estado = 'jogo';
  //     sala.rodada = 1;
  //     sala.turno = 0;
  //     sala.pontuacao = [0, 0];
  //     sala.acertos = [0, 0];
  //     sala.maxRodadas = (sala.configuracoes && sala.configuracoes.maxRodadas) ? sala.configuracoes.maxRodadas : 5;
  //     sala.cartasRestantes = [...cartas];
  //     shuffle(sala.cartasRestantes);
  //     sala.cartaAtual = sala.cartasRestantes.pop();
  //     sala.dicaAtual = 1;
  //     sala.respondeu = false;
  
  //     const estadoInicial = {
  //       rodada: sala.rodada,
  //       maxRodadas: sala.maxRodadas,
  //       turno: sala.turno,
  //       carta: {
  //         categoria: sala.cartaAtual.categoria,
  //         dicas: sala.cartaAtual.dicas.slice(0, sala.dicaAtual)
  //       },
  //       pontuacao: sala.pontuacao,
  //       acertos: sala.acertos,
  //       grupos: sala.grupos
  //     };
  
  //     io.to(codigo).emit('iniciarJogo', estadoInicial);
  
  //     setTimeout(() => {
  //       enviarEstadoJogo(codigo);
  //       // Iniciar timer para primeira rodada
  //       setTimeout(() => {
  //         iniciarTimerJogo(codigo);
  //       }, 1000);
  //     }, 1000);
  //   }
  // });
  
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
  
      const rodadasPossiveis = Math.min(sala.maxRodadas, sala.cartasRestantes.length);
      sala.maxRodadas = rodadasPossiveis;
  
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
        // Iniciar timer para primeira rodada
        setTimeout(() => {
          iniciarTimerJogo(codigo);
        }, 1000);
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
    if (!sala || sala.estado !== 'jogo') return;
    const turno = sala.turno;
    
    if (resposta.trim().toLowerCase() === sala.cartaAtual.resposta.toLowerCase()) {
      // Pontuação por dica
      const pontosPorDica = [10, 8, 5, 3, 1];
      const pontos = pontosPorDica[sala.dicaAtual - 1] || 1;
      sala.pontuacao[turno] += pontos;
      sala.acertos[turno] += 1;
      
      // Evento de áudio: sucesso (apenas para o grupo que está jogando)
      io.to(socket.id).emit('audioEvent', { tipo: 'success', acao: 'play' });
      
      // Feedback apenas para o grupo que está jogando
      io.to(socket.id).emit('feedback', { tipo: 'acerto', pontos });
      
      // Continuar com nova pergunta (não parar timer)
      setTimeout(() => {
        proximaPergunta(codigo);
      }, 1200);
    } else {
      // Evento de áudio: erro (apenas para o grupo que está jogando)
      io.to(socket.id).emit('audioEvent', { tipo: 'buzzer', acao: 'play' });
      
      // Feedback apenas para o grupo que está jogando
      io.to(socket.id).emit('feedback', { tipo: 'erro' });
      // NÃO chamar proximaPergunta ao errar, apenas atualize o estado para mostrar feedback
      // A carta permanece até acertar ou acabar o tempo
      // Apenas reenvie o estado para atualizar dicas, se necessário
      setTimeout(() => {
        enviarEstadoJogo(codigo);
      }, 1200);
    }
  });

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
      grupos: sala.grupos,
      timer: {
        tempo: sala.tempoRestante || 60,
        maxTempo: 60,
        ativo: sala.timerAtivo || false
      }
    });
  });

  // --- DESCONEXÃO ---
  socket.on('disconnect', () => {
    const codigo = socket.sala;
    if (!codigo || !salas[codigo]) return;
    const sala = salas[codigo];
    // Marcar grupo como desconectado
    const grupo = sala.grupos.find(g => g.id === socket.id);
    if (grupo) {
      grupo.desconectado = true;
      grupo.id = null; // Limpa id do socket
      console.log(`[LOG] Grupo ${grupo.nome} marcado como desconectado na sala ${codigo}`);
    }
    // Se todos os grupos estão desconectados, inicia timeout para remoção da sala
    const todosDesconectados = sala.grupos.every(g => g.desconectado);
    if (todosDesconectados) {
      if (salaTimeouts[codigo]) clearTimeout(salaTimeouts[codigo]);
      salaTimeouts[codigo] = setTimeout(() => {
        // Remove grupos desconectados
        sala.grupos = sala.grupos.filter(g => !g.desconectado);
        // Se não sobrou ninguém, remove a sala
        if (sala.grupos.length === 0) {
          delete salas[codigo];
          delete salaTimeouts[codigo];
          delete gameTimers[codigo];
          console.log(`Sala ${codigo} removida (timeout atingido).`);
        }
      }, 2 * 60 * 1000);
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