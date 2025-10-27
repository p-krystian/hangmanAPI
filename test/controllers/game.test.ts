import { expect } from 'jsr:@std/expect';
import Game from '@/controllers/game.ts';
import createPlayer from '@/utils/createPlayer.ts';

Deno.test('Game controller works properly', async (t) => {
  const player0ID = 'p-0';
  const player1ID = 'p-1';
  const player0 = createPlayer(player0ID);
  const game = new Game({
    id: 'g-0',
    lang: 'en',
    name: 'TEST',
    started: false,
    players: [player0],
  });

  await t.step('there is no opponent', () => {
    expect(game.getOpponent(player0ID)).toBeUndefined();
  });

  await t.step('next round is not ready', () => {
    expect(game.nextReady()).toBe(false);
  });

  await t.step('second player can join', () => {
    expect(game.joinPlayer(player1ID)).toBe(true);
  });

  await t.step('third player can not join', () => {
    expect(() => {
      game.joinPlayer('p-99');
    }).toThrow();
  });

  await t.step('next round is ready', () => {
    expect(game.nextReady()).toBe(true);
  });

  await t.step('is possible to get opponent', () => {
    expect(game.getOpponent(player1ID)).toEqual(player0);
  });

  await t.step('game can start', () => {
    game.start();
    expect(game.started).toBe(true);
  });

  await t.step('players can set phrases', () => {
    expect(game.setPhrase(player0ID, 'hangman')).toBe(false);
    expect(game.setPhrase(player1ID, 'hangman')).toBe(true);
  });

  await t.step('players can check phrases', () => {
    expect(game.checkPhrase(player0ID, 'hangman')).toBe(false);
    expect(game.nextReady()).toBe(false);

    expect(game.checkPhrase(player1ID, 'test')).toBe(true);
    expect(game.nextReady()).toBe(true);
  });

  await t.step('points counts corectly', () => {
    const expectedOutput = {
      wins: 1,
      rounds: 1,
      oWins: 0,
      oRounds: 1,
    };

    expect(game.getData(player0ID)).toEqual(expectedOutput);
  });
});
