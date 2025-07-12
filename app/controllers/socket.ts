import SocketType from '@/types/sioSocket.ts';
import GamesController from '@/controllers/games.ts';
import ok from '@/utils/validators.ts';
import { Game as GameType } from '@/types/game.ts';
import { ServerEvents as se } from '@/types/events.ts';
import { PublicGame } from '@/types/game.ts';
import queryVariables from '@/types/queryVariables.ts';

type Lang = ReturnType<typeof ok.langCode>;

const lobbyRoom = (lang: Lang): `lobby-${Lang}` => `lobby-${lang}`;
const gameRoom = (id: string): `game-${string}` => `game-${id}`;
const getPublicGames = (lang: Lang) => (
  GamesController.getFree(lang).map(
    (game) => ({ id: game.id, name: game.name } as PublicGame),
  )
);
const broadcastGames = (socket: SocketType, lang: Lang) => (
  socket.to(lobbyRoom(lang)).emit(se.GAME_LIST, getPublicGames(lang))
);

class SocketController {
  socket: SocketType;
  gameID: GameType['id'] | null;
  lang: Lang;

  constructor(socket: SocketType) {
    this.socket = socket;
    this.gameID = null;
    this.lang = ok.langCode(
      socket.handshake.query.get(queryVariables.LANG_CODE),
    );
  }

  playerCleanup() {
    if (!this.gameID) return;
    const id = this.gameID;
    this.gameID = null;

    const game = GamesController.get(id);

    if (!game) return;

    GamesController.delete(id);

    if (game.started) {
      this.socket.to(gameRoom(id)).emit(se.OPPONENT_EXIT);
    } else {
      broadcastGames(this.socket, game.lang);
    }
  }

  joinLobby() {
    this.playerCleanup();
    this.socket.join(lobbyRoom(this.lang));
    this.socket.emit(se.GAME_LIST, getPublicGames(this.lang));
  }

  createGame(name: unknown) {
    const gameName = ok.gameName(name);

    this.socket.leave(lobbyRoom(this.lang));
    const game = GamesController.create(gameName, this.lang, this.socket.id);

    this.socket.join(gameRoom(game.id));
    this.gameID = game.id;
    this.socket.emit(se.WAIT_START);

    broadcastGames(this.socket, this.lang);
  }

  joinGame(id: unknown) {
    if (typeof id !== 'string' || this.gameID) {
      return;
    }

    const game = GamesController.get(id);
    if (!game || game.started) {
      this.socket.emit(se.GAME_LIST, getPublicGames(this.lang));
      return;
    }

    this.socket.leave(lobbyRoom(this.lang));
    this.socket.join(gameRoom(game.id));
    this.gameID = game.id;

    if (game.joinPlayer(this.socket.id)) {
      game.start();
      this.socket.emit(se.GIVE_PHRASE);
      this.socket.to(gameRoom(game.id)).emit(se.GIVE_PHRASE);
    }

    broadcastGames(this.socket, this.lang);
  }

  writePhrase(phrase: unknown) {
    const game = GamesController.get(this.gameID || '');
    if (!game) {
      return;
    }
    const selfPhrase = ok.phrase(game.lang, phrase);

    if (game.submitPhrase(this.socket.id, selfPhrase)) {
      const opponent = game.getOpponent(this.socket.id)!;
      this.socket.emit(se.START_GAME, opponent.phrase!);
      this.socket.to(opponent.id).emit(se.START_GAME, selfPhrase);
    } else {
      this.socket.emit(se.WAIT_START);
    }
  }
}

export default SocketController;
