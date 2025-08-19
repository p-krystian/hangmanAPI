import { Socket as SioSocket } from 'socket.io';
import { ClientToServer, ServerToClient } from '@/types/sioServer.ts';

type Socket = SioSocket<ClientToServer, ServerToClient>;

export default Socket;
