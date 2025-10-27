import { expect } from 'jsr:@std/expect';
import validators from '@/utils/validators.ts';
import {
  gameNameLen,
  phraseLen,
  supportedFront,
  supportedLangs,
} from '@/utils/config.ts';

function generateString(minLength: number, maxLength: number, chars: string) {
  const randomLen = Math.round(
    Math.random() * (maxLength - minLength) + minLength,
  );
  const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

  let string = '';

  for (let i = 0; i < randomLen; i++) {
    string += getRandomChar();
  }

  return string;
}

Deno.test('version validator passes supprted version', () => {
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
  for (const lang in supportedLangs) {
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
  const enChars = supportedLangs['en'];

  const randomGameName = generateString(
    gameNameLen.min,
    gameNameLen.max,
    enChars,
  );

  expect(validators.gameName(randomGameName)).toBe(randomGameName);
});
Deno.test('gameName validator throws incorrect game name', () => {
  const randomToLongName = generateString(
    gameNameLen.max + 1,
    gameNameLen.max + 8,
    '123,/.abc ',
  );

  expect(() => {
    validators.gameName(321);
  }).toThrow();
  expect(() => {
    validators.gameName(randomToLongName);
  }).toThrow();
});

Deno.test('phrase validator passes correct phrase', () => {
  const enChars = supportedLangs['en'];

  const randomPhrase = generateString(
    phraseLen.min,
    phraseLen.max,
    enChars,
  );

  expect(validators.phrase('en', randomPhrase)).toBe(
    randomPhrase,
  );
});
Deno.test('phrase validator throws incorrect phrase', () => {
  const enChars = supportedLangs['en'];

  const randomToLongPhrase = generateString(
    phraseLen.max + 1,
    phraseLen.max + 8,
    enChars,
  );
  const randomSymbolicPhrase = generateString(
    phraseLen.min,
    phraseLen.max,
    '!@#$%^&*()_+<>?,./;',
  );

  expect(() => {
    validators.phrase('en', randomToLongPhrase);
  }).toThrow();
  expect(() => {
    validators.phrase('en', randomSymbolicPhrase);
  }).toThrow();
});
