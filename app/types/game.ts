import { supportedLangs } from '../utils/config.ts';

type GameData = {
  wins: number;
  rounds: number;
  oWins: number;
  oRounds: number;
};

type PlayerData = {
  id: string;
  wins: number;
  rounds: number;
  phrase: string | null;
};

type Game = {
  id: string;
  name: string;
  players: [PlayerData, PlayerData?];
  started: boolean;
  lang: keyof typeof supportedLangs;
};

type PublicGame = Pick<Game, 'id' | 'name'>;

export { type Game, type GameData, type PlayerData, type PublicGame };
