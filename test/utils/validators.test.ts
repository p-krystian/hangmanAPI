import { expect } from 'jsr:@std/expect';
import validators from '@/utils/validators.ts';
import {
  gameNameLen,
  phraseLen,
  supportedFront,
  supportedLangs,
} from '@/utils/config.ts';

Deno.test('version validator passes supported version', () => {
  expect(validators.version(supportedFront)).toBe(supportedFront);
});
Deno.test('version validator throws unsupported version', () => {
  expect(() => {
    validators.version('0.0.0');
  }).toThrow();

  expect(() => {
    validators.version('version');
  }).toThrow();

  expect(() => {
    validators.version(12);
  }).toThrow();
});

Deno.test('langCode validator passes supported langs', () => {
  for (const lang of Object.keys(supportedLangs)) {
    expect(validators.langCode(lang)).toBe(lang);
  }
});
Deno.test('langCode validator throws unsupported lang', () => {
  expect(() => {
    validators.langCode(12);
  }).toThrow();
  expect(() => {
    validators.langCode('xyz');
  }).toThrow();
});

Deno.test('gameName validator passes correct game name', () => {
  const shortestGameName = 'X'.repeat(gameNameLen.min);
  const longestGameName = 'X'.repeat(gameNameLen.min);

  expect(validators.gameName(shortestGameName)).toBe(shortestGameName);
  expect(validators.gameName(longestGameName)).toBe(longestGameName);
});
Deno.test('gameName validator throws incorrect game name', () => {
  const randomTooLongName = 'X'.repeat(gameNameLen.max + 1);
  const randomTooShortName = 'X'.repeat(gameNameLen.min - 1);

  expect(() => {
    validators.gameName(321);
  }).toThrow();
  expect(() => {
    validators.gameName(randomTooLongName);
  }).toThrow();
  expect(() => {
    validators.gameName(randomTooShortName);
  }).toThrow();
});

Deno.test('phrase validator passes correct phrase', () => {
  const okChar = supportedLangs['en'][0];

  const shortestPhrase = okChar.repeat(phraseLen.min);
  const longestPhrase = okChar.repeat(phraseLen.max);

  expect(validators.phrase('en', shortestPhrase)).toBe(shortestPhrase);
  expect(validators.phrase('en', longestPhrase)).toBe(longestPhrase);
});
Deno.test('phrase validator throws incorrect phrase', () => {
  const okChar = supportedLangs['en'][0];

  const randomTooLongPhrase = okChar.repeat(phraseLen.max + 1);
  const randomTooShortPhrase = okChar.repeat(phraseLen.min - 1);
  const randomSymbolicPhrase = '>'.repeat(
    Math.floor((phraseLen.min + phraseLen.max) / 2),
  );

  expect(() => {
    validators.phrase('en', randomTooLongPhrase);
  }).toThrow();
  expect(() => {
    validators.phrase('en', randomTooShortPhrase);
  }).toThrow();
  expect(() => {
    validators.phrase('en', randomSymbolicPhrase);
  }).toThrow();
});
