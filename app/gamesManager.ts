import { Game as GameType, PlayerData as PlayerType } from './types/game.ts';

class GamesManager {
  gameList = new Map<GameType['id'], GameType>();

  get(id: GameType['id']) {
    return this.gameList.get(id);
  }

  getFree(lang: GameType['lang']) {
    return [...this.gameList.values()].filter(
      (g) => g.lang === lang && !g.started,
    );
  }

  delete(id: GameType['id']) {
    return this.gameList.delete(id);
  }

  create(
    name: GameType['name'],
    lang: GameType['lang'],
    creatorID: PlayerType['id'],
  ) {
    const id = crypto.randomUUID() as string;
    const game = {
      id: id,
      name: name,
      lang: lang,
      started: false,
      players: [this.createPlayer(creatorID)],
    } as GameType;
    this.gameList.set(id, game);
    return game;
  }

  private createPlayer(
    id: PlayerType['id'],
    phrase: PlayerType['phrase'] = null,
  ) {
    return {
      id: id,
      phrase: phrase,
      wins: 0,
      rounds: 0,
    } as PlayerType;
  }
}

export default GamesManager;
