import { Socket as SioSocket } from 'socket.io';
import { ClientToServer, ServerToClient } from './sioServer.ts';

type Socket = SioSocket<ClientToServer, ServerToClient>;

export default Socket;
