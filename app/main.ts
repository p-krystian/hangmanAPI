import { Server } from 'socket.io';
import { ClientToServer, ServerToClient } from '@/types/sioServer.ts';
import { config } from './utils/config.ts';
import registerSocket from './utils/registerSocket.ts';

const serverOptions = {
  onListen({ port, hostname }: { port: number; hostname: string }) {
    console.log(`Server started: ${new Date().toLocaleString()}`);
    console.log(`Listening: http://${hostname}:${port}`);
  },
  port: config.port,
  hostname: config.hostname,
};
const handlerOptions = {
  cors: { origin: config.corsOrigin, credentials: true },
  path: config.socketPath,
};
const httpHandler = (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === '/test') {
    return new Response('OK');
  }
  return new Response(null, {
    status: 301,
    headers: { 'Location': config.redirectURL },
  });
};

const io = new Server<ClientToServer, ServerToClient>(handlerOptions);
io.on('connection', registerSocket);

const server = Deno.serve(
  serverOptions,
  io.handler(httpHandler),
);

server.finished.then(() => {
  console.log(`Server stopped: ${new Date().toLocaleString()}`);
});
