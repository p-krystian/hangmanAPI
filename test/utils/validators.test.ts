import validators from '@/utils/validators.ts';
import {
  gameNameLen,
  phraseLen,
  supportedFront,
  supportedLangs,
} from '@/utils/config.ts';
import { expect } from 'jsr:@std/expect';

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
  const firstSupportedLang = Object.keys(
    supportedLangs,
  )[0] as keyof typeof supportedLangs;
  const firstSupportedChars = supportedLangs[firstSupportedLang];

  const randomGameName = generateString(
    gameNameLen.min,
    gameNameLen.max,
    firstSupportedChars,
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
  const firstSupportedLang = Object.keys(
    supportedLangs,
  )[0] as keyof typeof supportedLangs;
  const firstSupportedChars = supportedLangs[firstSupportedLang];

  const randomPhrase = generateString(
    phraseLen.min,
    phraseLen.max,
    firstSupportedChars,
  );

  expect(validators.phrase(firstSupportedLang, randomPhrase)).toBe(
    randomPhrase,
  );
});
Deno.test('phrase validator throws incorrect phrase', () => {
  const firstSupportedLang = Object.keys(
    supportedLangs,
  )[0] as keyof typeof supportedLangs;
  const firstSupportedChars = supportedLangs[firstSupportedLang];

  const randomToLongPhrase = generateString(
    phraseLen.max + 1,
    phraseLen.max + 8,
    firstSupportedChars,
  );
  const randomSymbolicPhrase = generateString(
    phraseLen.min,
    phraseLen.max,
    '!@#$%^&*()_+<>?,./;',
  );

  expect(() => {
    validators.phrase(firstSupportedLang, randomToLongPhrase);
  }).toThrow();
  expect(() => {
    validators.phrase(firstSupportedLang, randomSymbolicPhrase);
  }).toThrow();
});
