import { expect } from 'jsr:@std/expect';
import createPlayer from '@/utils/createPlayer.ts';

Deno.test('createPlayer creates player object correctly', () => {
  const expectedObject = {
    id: '1234',
    phrase: null,
    wins: 0,
    rounds: 0,
  };
  const playerObject = createPlayer('1234');

  expect(playerObject).toEqual(expectedObject);
});
