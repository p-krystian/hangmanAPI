import { PlayerData as PlayerType } from '@/types/game.ts';

function createPlayer(id: PlayerType['id']) {
  return {
    id: id,
    phrase: null,
    wins: 0,
    rounds: 0,
  } as PlayerType;
}

export default createPlayer;
