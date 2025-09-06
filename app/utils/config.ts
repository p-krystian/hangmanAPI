const config = {
  hostname: Deno.env.get('HOSTNAME') || '127.0.0.1',
  port: Number(Deno.env.get('PORT')) || 4321,
  socketPath: Deno.env.get('SOCKET_PATH') || '/',
  corsOrigin: Deno.env.get('ORIGIN') || '*',
  redirectURL: Deno.env.get('REDIRECT_URL') || '',
} as const;

const supportedLangs = {
  pl: 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŻŹ ',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ  ',
} as const;

const supportedFront = '0.9.0';
const gameNameLen = { min: 3, max: 12 } as const;
const phraseLen = { min: 3, max: 20 } as const;

export { config, gameNameLen, phraseLen, supportedFront, supportedLangs };
