import createPlayer from '@/utils/createPlayer.ts';
import { expect } from 'jsr:@std/expect';

Deno.test('createPlayer creates player object correctly', () => {
  const expectedObject = {
    id: '1234',
    phrase: null,
    wins: 0,
    rounds: 0,
  };
  const playerObject = createPlayer('1234', null);

  expect(playerObject).toEqual(expectedObject);
});
