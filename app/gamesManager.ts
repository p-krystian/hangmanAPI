import {
  Game as GameDataType,
  PlayerData as PlayerType,
} from './types/game.ts';

type ID = GameDataType['id'];

function createPlayer(
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

class Game {
  id: GameDataType['id'];
  name: GameDataType['name'];
  lang: GameDataType['lang'];
  started: GameDataType['started'];
  players: GameDataType['players'];

  constructor({ id, name, lang, started, players }: GameDataType) {
    this.id = id;
    this.name = name;
    this.lang = lang;
    this.started = started;
    this.players = players;
  }

  getOpponent(playerID: PlayerType['id']){
    return this.players.find((p) => p.id !== playerID);
  }

  joinPlayer(playerID: PlayerType['id']) {
    return this.players.push(createPlayer(playerID)) === 2;
  }

  start() {
    this.started = true;
  }

  submitPhrase(playerID: PlayerType['id'], phrase: string) {
    this.players.find((p) => p.id === playerID)!.phrase = phrase;
    return this.players.every((p) => p.phrase);
  }
}
class GamesManager {
  gameList = new Map<ID, Game>();

  get(id: ID) {
    return this.gameList.get(id);
  }

  getFree(lang: GameDataType['lang']) {
    return [...this.gameList.values()].filter(
      (g) => g.lang === lang && !g.started,
    );
  }

  delete(id: ID) {
    return this.gameList.delete(id);
  }

  create(
    name: GameDataType['name'],
    lang: GameDataType['lang'],
    creatorID: PlayerType['id'],
  ) {
    const id = crypto.randomUUID() as string;
    const game = new Game({
      id: id,
      name: name,
      lang: lang,
      started: false,
      players: [createPlayer(creatorID)],
    } as GameDataType);
    this.gameList.set(id, game);
    return game;
  }
}

export default GamesManager;
