import Socket from './types/sioSocket.ts';
import { ClientEvents as ce, ServerEvents as se } from './types/events.ts';
import { supportedLangs } from './utils/config.ts';
import ok from './utils/validators.ts';
import GamesManager from './gamesManager.ts';
import { PublicGame } from './types/game.ts';

type Lang = keyof typeof supportedLangs;

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
  if (!ok.version(frontVer)) {
    socket.emit(se.OLD_VERSION); // VALIDATION
    return;
  }
  if (!ok.langCode(langCode)) {
    socket.emit(se.UNSUPPORTED_LANG); // VALIDATION
    return;
  }

  const lang = langCode as Lang; // FIX type

  playerCleanup(socket);
  socket.gameID = null;
  socket.lang = lang;
  socket.join(`lobby-${langCode}`);
  socket.emit(se.GAME_LIST, getPublicGames(lang));
}

function createGame(socket: Socket, name: unknown) {
  const lang = socket.lang as Lang; // VALIDATION
  const gameName = name as string; // VALIDATION

  socket.leave(`lobby-${lang}`);
  const game = GAMES_MANAGER.create(gameName, lang, socket.id);

  socket.join(game.id);
  socket.gameID = game.id;
  socket.emit(se.WAIT_START);

  broadcastGames(socket, lang);
}

function registerSocketActions(socket: Socket) {
  socket.on('disconnecting', () => playerCleanup(socket));

  socket.on(ce.JOIN_LOBBY, (lang, ver) => joinLobby(socket, lang, ver));
  socket.on(ce.CREATE_GAME, (name) => createGame(socket, name));
}

export { registerSocketActions };
