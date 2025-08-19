import { GameData, PublicGame } from '@/types/game.ts';
import { ClientEvents as ce, ServerEvents as se } from '@/types/events.ts';

type ClientString = string | unknown;

type ClientToServer = {
  [ce.JOIN_LOBBY]: () => void;
  [ce.CREATE_GAME]: (name: ClientString) => void;
  [ce.JOIN_GAME]: (id: ClientString) => void;
  [ce.WRITE_PHRASE]: (phrase: ClientString) => void;
  [ce.END_ROUND]: (phrase: ClientString) => void;
  [ce.NEXT_ROUND]: () => void;
};

type ServerToClient = {
  [se.GAME_LIST]: (games: PublicGame[]) => void;
  [se.WAIT_START]: () => void;
  [se.GIVE_PHRASE]: () => void;
  [se.START_GAME]: (phrase: string) => void;
  [se.GAME_DATA]: (data: GameData) => void;
  [se.OPPONENT_EXIT]: () => void;
  [se.OLD_VERSION]: () => void;
  [se.UNSUPPORTED_LANG]: () => void;
  [se.INVALID_DATA]: () => void;
};

export { type ClientToServer, type ServerToClient };
