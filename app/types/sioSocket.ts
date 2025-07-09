import { Socket as SioSocket } from 'socket.io';
import { supportedLangs } from '../utils/config.ts';
import { Game as GameType } from '../types/game.ts';
import SocketServer from './sioServer.ts';

type Socket = SioSocket<SocketServer> & {
  gameID?: GameType['id'] | null;
  lang?: keyof typeof supportedLangs;
};

export default Socket;
