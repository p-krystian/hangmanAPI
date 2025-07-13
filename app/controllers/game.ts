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

  getData(playerID: PID) {
    const self = this.players.find((p) => p.id === playerID)!;
    const opponent = this.getOpponent(playerID)!;

    return {
      wins: self.wins,
      rounds: self.rounds,
      oWins: opponent.wins,
      oRounds: opponent.rounds,
    };
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
   * Assigns the entered phrase to the player with the given ID.
   * Returns true if all players have set their phrases, otherwise false.
   */
  setPhrase(playerID: PID, phrase: string) {
    this.players.find((p) => p.id === playerID)!.phrase = phrase;
    return this.players.every((p) => p.phrase);
  }

  /**
   * Checks if the provided phrase matches the phrase set by opponent .
   * Increments the current player's round count, and if the guess is correct,
   * increments their win count. Clears the checkd phrase after checking.
   * Returns true if all players phrases have been checkd, otherwise false.
   */
  checkPhrase(playerID: PID, phrase: unknown) {
    const opponentIndex = this.players.findIndex((p) => p.id !== playerID);
    const selfIndex = Number(!opponentIndex);

    this.players[selfIndex].rounds++;
    if (this.players[opponentIndex].phrase === phrase) {
      this.players[selfIndex].wins++;
    }
    this.players[opponentIndex].phrase = null;

    return this.players.every((p) => !p.phrase);
  }

  nextReady(){
    return this.players[0].rounds === this.players[1]?.rounds;
  }
}

export default Game;
