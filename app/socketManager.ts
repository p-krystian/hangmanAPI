import Socket from './types/sioSocket.ts';
import { ClientEvents as ce, ServerEvents as se } from './types/events.ts';
import ok from './utils/validators.ts';
import GamesManager from './gamesManager.ts';
import { PublicGame } from './types/game.ts';

type Lang = ReturnType<typeof ok.langCode>;

const GAMES_MANAGER = new GamesManager();

const getPublicGames = (lang: Lang) => (
  GAMES_MANAGER.getFree(lang).map(
    (game) => ({ id: game.id, name: game.name } as PublicGame),
  )
);

const broadcastGames = (socket: Socket, lang: Lang) => (
  socket.to(`lobby-${lang}`).emit(se.GAME_LIST, getPublicGames(lang))
);

function playerCleanup(socket: Socket) {
  if (!socket.gameID) return;

  const game = GAMES_MANAGER.get(socket.gameID);

  if (!game) return;

  GAMES_MANAGER.delete(socket.gameID);

  if (game.started) {
    socket.to(game.id).emit(se.OPPONENT_EXIT);
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
  socket.join(`lobby-${langCode}`);
  socket.emit(se.GAME_LIST, getPublicGames(lang));
}

function createGame(socket: Socket, name: unknown) {
  const lang = ok.langCode(socket.lang);
  const gameName = ok.gameName(name);

  socket.leave(`lobby-${lang}`);
  const game = GAMES_MANAGER.create(gameName, lang, socket.id);

  socket.join(game.id);
  socket.gameID = game.id;
  socket.emit(se.WAIT_START);

  broadcastGames(socket, lang);
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
}

export { registerSocketActions };
