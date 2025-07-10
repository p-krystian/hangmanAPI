import { z } from 'zod';
import { greaterThan, parse } from 'semver';
import { gameNameLen, supportedFront, supportedLangs } from './config.ts';

function version(ver: unknown): string {
  const version = z.string().parse(ver);

  if (!greaterThan(parse(supportedFront), parse(version))) {
    throw new Error('Unsupported version');
  }
  return version;
}

const langCodeSchema = z.enum(
  Object.keys(supportedLangs) as [keyof typeof supportedLangs],
);
const gameNameSchema = z.string().min(gameNameLen.min).max(gameNameLen.max);

export default {
  version: version,
  langCode: langCodeSchema.parse,
  gameName: gameNameSchema.parse,
};
