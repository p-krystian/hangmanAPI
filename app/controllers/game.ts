import { Game as GameType, PlayerData as PlayerType } from '@/types/game.ts';
import createPlayer from '@/utils/createPlayer.ts';

type PID = PlayerType['id'];

class Game {
  id: GameType['id'];
  name: GameType['name'];
  lang: GameType['lang'];
  started: GameType['started'];
  players: GameType['players'];

  constructor({ id, name, lang, started, players }: GameType) {
    this.id = id;
    this.name = name;
    this.lang = lang;
    this.started = started;
    this.players = players;
  }

  getOpponent(playerID: PID) {
    return this.players.find((p) => p.id !== playerID);
  }

  joinPlayer(playerID: PID) {
    return this.players.push(createPlayer(playerID)) === 2;
  }

  start() {
    this.started = true;
  }

  submitPhrase(playerID: PID, phrase: string) {
    this.players.find((p) => p.id === playerID)!.phrase = phrase;
    return this.players.every((p) => p.phrase);
  }
}

export default Game;
