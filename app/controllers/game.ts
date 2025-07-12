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

  /**
   * Adds a player to the game by their ID.
   * Returns true if the game is now full, otherwise false.
   */
  joinPlayer(playerID: PID) {
    if (this.players.length >= 2) {
      throw new Error('Game is full');
    }
    return this.players.push(createPlayer(playerID)) === 2;
  }

  start() {
    this.started = true;
  }

  /**
   * Assigns the submitted phrase to the player with the given ID.
   * Returns true if all players have submitted their phrases, otherwise false.
   */
  submitPhrase(playerID: PID, phrase: string) {
    this.players.find((p) => p.id === playerID)!.phrase = phrase;
    return this.players.every((p) => p.phrase);
  }
}

export default Game;
