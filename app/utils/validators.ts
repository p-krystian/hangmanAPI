// import { z } from 'zod/v4';
import { greaterThan, parse } from 'semver';
import { gameNameLength, supportedFront, supportedLangs } from './config.ts';

function version(ver: unknown) {
  if (typeof ver !== 'string') {
    return false;
  }

  return greaterThan(parse(supportedFront), parse(ver));
}

function langCode(langCode: unknown) {
  return (
    typeof langCode === 'string' && langCode in supportedLangs
  );
}

function gameName(gameName: unknown) {
  if (typeof gameName !== 'string') {
    return false;
  }

  const name = gameName.trim();
  return (
    name.length >= gameNameLength.min &&
    name.length <= gameNameLength.max
  );
}

export default { version, langCode, gameName };
