import Socket from './types/sioSocket.ts';
import { ClientEvents as ce, ServerEvents as se } from './types/events.ts';
import ok from './utils/validators.ts';
import GamesManager from './gamesManager.ts';
import { PublicGame } from './types/game.ts';

type Lang = ReturnType<typeof ok.langCode>;

const GAMES_MANAGER = new GamesManager();

const lobbyRoom = (lang: Lang): `lobby-${Lang}` => `lobby-${lang}`;
const gameRoom = (id: string): `game-${string}` => `game-${id}`;

const getPublicGames = (lang: Lang) => (
  GAMES_MANAGER.getFree(lang).map(
    (game) => ({ id: game.id, name: game.name } as PublicGame),
  )
);

const broadcastGames = (socket: Socket, lang: Lang) => (
  socket.to(lobbyRoom(lang)).emit(se.GAME_LIST, getPublicGames(lang))
);

function playerCleanup(socket: Socket) {
  const id = socket.gameID;
  socket.gameID = null;
  if (!id) return;

  const game = GAMES_MANAGER.get(id);

  if (!game) return;

  GAMES_MANAGER.delete(id);

  if (game.started) {
    socket.to(gameRoom(id)).emit(se.OPPONENT_EXIT);
  } else {
    broadcastGames(socket, game.lang);
  }
}

function joinLobby(socket: Socket, langCode: unknown, frontVer: unknown) {
  let lang: Lang;

  try {
    ok.version(frontVer);
  } catch {
    socket.emit(se.OLD_VERSION);
    return;
  }
  try {
    lang = ok.langCode(langCode);
  } catch {
    socket.emit(se.UNSUPPORTED_LANG);
    return;
  }

  playerCleanup(socket);
  socket.gameID = null;
  socket.lang = lang;
  socket.join(lobbyRoom(lang));
  socket.emit(se.GAME_LIST, getPublicGames(lang));
}

function createGame(socket: Socket, name: unknown) {
  const lang = ok.langCode(socket.lang);
  const gameName = ok.gameName(name);

  socket.leave(lobbyRoom(lang));
  const game = GAMES_MANAGER.create(gameName, lang, socket.id);

  socket.join(gameRoom(game.id));
  socket.gameID = game.id;
  socket.emit(se.WAIT_START);

  broadcastGames(socket, lang);
}

function joinGame(socket: Socket, id: unknown) {
  const lang = ok.langCode(socket.lang);
  if (typeof id !== 'string' || socket.gameID) {
    return;
  }

  const game = GAMES_MANAGER.get(id);
  if (!game || game.started) {
    socket.emit(se.GAME_LIST, getPublicGames(lang));
    return;
  }

  socket.leave(lobbyRoom(lang));
  socket.join(gameRoom(game.id));
  socket.gameID = game.id;

  if (game.joinPlayer(socket.id)) {
    game.start();
    socket.emit(se.GIVE_PHRASE);
    socket.to(gameRoom(game.id)).emit(se.GIVE_PHRASE);
  }

  broadcastGames(socket, lang);
}

function writePhrase(socket: Socket, phrase: unknown) {
  const game = GAMES_MANAGER.get(socket.gameID!);
  if (!game) {
    return;
  }
  const selfPhrase = ok.phrase(game.lang, phrase);

  if (game.submitPhrase(socket.id, selfPhrase)) {
    const opponent = game.getOpponent(socket.id)!;
    socket.emit(se.START_GAME, opponent.phrase!);
    socket.to(opponent.id).emit(se.START_GAME, selfPhrase);
  }
  else{
    socket.emit(se.WAIT_START);
  }
}

function registerSocketActions(socket: Socket) {
  function wrap<AT extends readonly unknown[]>(
    listener: (socket: Socket, ...args: AT) => void,
    args: AT,
  ) {
    try {
      return listener(socket, ...args);
    } catch (err) {
      socket.emit(se.INVALID_DATA);
      console.warn(err instanceof Error ? err.message : err);
    }
  }

  socket.on('disconnecting', () => playerCleanup(socket));

  socket.on(ce.JOIN_LOBBY, (...args) => wrap(joinLobby, args));
  socket.on(ce.CREATE_GAME, (...args) => wrap(createGame, args));
  socket.on(ce.JOIN_GAME, (...args) => wrap(joinGame, args));
  socket.on(ce.WRITE_PHRASE, (...args) => wrap(writePhrase, args));
}

export { registerSocketActions };
