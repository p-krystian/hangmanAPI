import { expect } from 'jsr:@std/expect';
import Game from '@/controllers/game.ts';
import GamesController from '@/controllers/games.ts';

Deno.test('Games controller works properly', async (t) => {
  const player0ID = 'p-0';
  const selectedLang = 'en';
  let game0ID: Game['id'];
  let game0: Game;

  await t.step('new game creation works properly', () => {
    const game0Local = GamesController.create('TEST', selectedLang, player0ID);
    expect(game0Local).toMatchObject({
      id: expect.any(String),
      name: 'TEST',
      lang: 'en',
    });
    game0ID = game0Local.id;
  });

  await t.step('game can be got', () => {
    const game0Local = GamesController.get(game0ID);
    expect(game0Local).toBeInstanceOf(Game);
    game0 = game0Local!;
  });

  await t.step('game shows as free in own language', () => {
    expect(GamesController.getFree(selectedLang)).toContain(game0);
  });

  await t.step('game not shows as free in other language', () => {
    expect(GamesController.getFree('pl')).not.toContain(game0);
  });

  await t.step('game not shows as free after start', () => {
    game0.start();
    expect(GamesController.getFree(selectedLang)).not.toContain(game0);
  });

  await t.step('game can be deleted', () => {
    expect(GamesController.delete(game0ID)).toBe(true);
    expect(GamesController.delete(game0ID)).toBe(false);
    expect(GamesController.get(game0ID)).toBeUndefined();
  });
});
