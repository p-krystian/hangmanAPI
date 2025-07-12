import { z } from 'zod';
import { greaterThan, parse } from 'semver';
import {
  gameNameLen,
  phraseLen,
  supportedFront,
  supportedLangs,
} from './config.ts';

const version = (ver: unknown) => {
  const version = z.string().parse(ver);

  if (!greaterThan(parse(supportedFront), parse(version))) {
    throw new Error('Unsupported version');
  }
  return version;
};
const langCodeSchema = z.enum(
  Object.keys(supportedLangs) as [keyof typeof supportedLangs],
);
const gameNameSchema = z.string().min(gameNameLen.min).max(gameNameLen.max);
const phrase = (lang: keyof typeof supportedLangs, phrase: unknown) => (
  z
    .string()
    .toUpperCase()
    .min(phraseLen.min)
    .max(phraseLen.max)
    .regex(new RegExp(`^[${supportedLangs[lang]}]+$`))
    .parse(phrase)
);

export default {
  version: version,
  langCode: langCodeSchema.parse,
  gameName: gameNameSchema.parse,
  phrase: phrase,
};
