import { Game as GameType, PlayerData as PlayerType } from '@/types/game.ts';
import Game from '@/controllers/game.ts';
import createPlayer from '../utils/createPlayer.ts';

type GID = GameType['id'];

class GamesController {
  gameList = new Map<GID, Game>();

  get(id: GID) {
    return this.gameList.get(id);
  }

  getFree(lang: GameType['lang']) {
    return [...this.gameList.values()].filter(
      (g) => g.lang === lang && !g.started,
    );
  }

  delete(id: GID) {
    return this.gameList.delete(id);
  }

  create(
    name: GameType['name'],
    lang: GameType['lang'],
    creatorID: PlayerType['id'],
  ) {
    const id = crypto.randomUUID() as string;
    const game = new Game({
      id: id,
      name: name,
      lang: lang,
      started: false,
      players: [createPlayer(creatorID)],
    } as GameType);
    this.gameList.set(id, game);
    return game;
  }
}

export default new GamesController();
