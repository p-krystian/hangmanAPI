import { PlayerData as PlayerType } from '@/types/game.ts';

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

export default createPlayer;
