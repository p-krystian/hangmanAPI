import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import semver from 'semver';
import 'dotenv/config';

const minFontVersion = '0.8.0';
const alphabets = {
  pl: "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŻŹ ",
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ "
};
const httpServer = createServer((req, res) => {
  if (req.url === '/test'){
    res.write('OK');
    res.end();
    return;
  }
  res.writeHead(301, { 'Location': process.env.REDIRECT_URL });
  res.end();
});
const io = new Server(httpServer, {
  cors: { origin: process.env.ORIGIN, credentials: true },
  path: process.env.SOCKET_PATH
});

const freeGames = Object.keys(alphabets).reduce(
  (o, k) => ({...o, [k]: {}}),
  {}
);
const startedGames = {};

const safeStr = (str, len, lang) => (
  str.trim()
    .toUpperCase()
    .substring(0, len)
    .split('')
    .filter(char => alphabets[lang].includes(char))
    .join('')
);
const inGame = socket => Boolean(startedGames[socket?.gameID]);
const opponentID = (gameID, playerID) => (
  // Object.keys(startedGames[gameID]).filter(id => id != playerID)[0]
  Object.keys(startedGames[gameID])
    .filter(id => !['language', playerID].includes(id))[0]
);
const opponentData = (gameID, playerID) => (
  startedGames[gameID][opponentID(gameID, playerID)]
);
const lobbyList = lang => (
  Object.keys(freeGames[lang]).map(id => ({id: id, name: freeGames[lang][id]}))
);

function sendGames(socket){
  socket.to(`lobby-${socket.lang}`).emit('game-list', lobbyList(socket.lang));
}
function createGame(socket, name){
  const lang = socket.lang;
  if (socket.gameID || name.trim().length < 3 || freeGames[lang].length >= 8)
    return;

  const id = uuidv4();
  freeGames[lang][id] = safeStr(name, 12, lang);
  socket.leave(`lobby-${lang}`);
  socket.join(id);
  socket.gameID = id;
  socket.emit('wait-start');
  sendGames(socket);
}
async function joinGame(socket, id){
  if (socket.gameID)
    return;

  const playersIn = await socket.in(id).fetchSockets();
  if (playersIn.length > 1){
    sendGames(socket);
    return;
  }
  delete freeGames[socket.lang][id];
  startedGames[id] = {
    language: socket.lang,
    [playersIn[0].id]: {wins: 0, rounds: 0, phrase: null},
    [socket.id]: {wins: 0, rounds: 0, phrase: null},
  };
  socket.gameID = id;
  socket.leave(`lobby-${socket.lang}`);
  socket.to(id).emit('give-phrase');
  socket.join(id);
  socket.emit('give-phrase');
  sendGames(socket);
}
function writePharse(socket, phrase){
  if (!inGame(socket) || phrase.trim().length < 3)
    return;

  const data = startedGames[socket.gameID];
  data[socket.id].phrase = safeStr(phrase, 20, data.language);

  if (
    Object.values(data)
      .filter(v => typeof(v) === 'object')
      .every(p => p.phrase)
  ){
    const opponentPhrase = opponentData(socket.gameID, socket.id).phrase;
    socket.emit('start-game', opponentPhrase);
    socket.to(
      opponentID(socket.gameID, socket.id)
    ).emit('start-game', data[socket.id].phrase);
    return;
  }
  socket.emit('wait-start');
}
function endGame(socket, phrase){
  if (!inGame(socket))
    return;

  const data = startedGames[socket.gameID];
  const opponentId = opponentID(socket.gameID, socket.id);
  const oData = opponentData(socket.gameID, socket.id);
  if (phrase === data[opponentId].phrase)
    data[socket.id].wins++;
  oData.phrase = null;

  if (Object.values(data).slice(1, 3).every(p => !p.phrase)){
    data[socket.id].rounds++;
    socket.emit('game-data', {
      wins: data[socket.id].wins,
      rounds: data[socket.id].rounds,
      oWins: oData.wins,
      oRounds: oData.rounds
    });
    socket.to(opponentId).emit('game-data', {
      wins: oData.wins,
      rounds: oData.rounds,
      oWins: data[socket.id].wins,
      oRounds: data[socket.id].rounds
    });
    return;
  }
  socket.emit('game-data', {
    wins: data[socket.id].wins,
    rounds: ++data[socket.id].rounds,
    oWins: oData.wins,
    oRounds: oData.rounds
  });
}
function continueGame(socket){
  if (!inGame(socket))
    return joinLobby(socket);

  const rounds = startedGames[socket.gameID][socket.id].rounds;
  const opponentRounds = opponentData(socket.gameID, socket.id).rounds;
  if (rounds !== opponentRounds)
    return;

  socket.emit('give-phrase');
}
function onDisconnect(socket){
  const id = socket?.gameID;

  if (!id) return;

  if (Object.keys(freeGames[socket.lang]).includes(id)){
    delete freeGames[socket.lang][id];
    sendGames(socket);
  }
  else if (Object.keys(startedGames).includes(id)){
    socket.to(id).emit('opponent-exit');
    delete startedGames[id];
  }
}
function joinLobby(socket, langData, frontVersion){
  onDisconnect(socket);
  socket.gameID = null;
  const [code, letters] = langData || [null, null];

  try{
    if (semver.gt(minFontVersion, frontVersion || '0.0.0'))
      return socket.emit('old-version');
  }
  catch{
    return socket.emit('old-version');
  }


  if (!letters?.split('').every(
    c => alphabets[code]?.includes(c.toUpperCase())
  )) return socket.emit('unsupported-lang');

  socket.lang = code;
  socket.join(`lobby-${code}`);
  socket.emit('game-list', lobbyList(code));
}

io.on('connection', socket => {
  socket.on('disconnecting', () => onDisconnect(socket));

  socket.on('join-lobby', (langData, ver) => joinLobby(socket, langData, ver));
  socket.on('create-game', name => createGame(socket, name));
  socket.on('join-game', id => joinGame(socket, id));
  socket.on('write-phrase', phrase => writePharse(socket, phrase));
  socket.on('end-game', phrase => endGame(socket, phrase));
  socket.on('continue-game', () => continueGame(socket));
});

httpServer.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Server started: ${new Date().toLocaleString()}`);
  console.log(`Hostname: ${process.env.HOSTNAME}`);
  console.log(`Port: ${process.env.PORT}`);
});
