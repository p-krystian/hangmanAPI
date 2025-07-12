import SocketController from '@/controllers/socket.ts';
import SocketType from '@/types/sioSocket.ts';
import { ClientEvents as ce, ServerEvents as se } from '@/types/events.ts';

function registerSocket(socket: SocketType) {
  const sCtrl = new SocketController(socket);

  function wrap<AT extends readonly unknown[]>(
    listener: (...args: AT) => void,
    args: AT,
  ) {
    try {
      return listener.bind(sCtrl)(...args);
    } catch (err) {
      socket.emit(se.INVALID_DATA);
      console.warn(err);
    }
  }

  socket.on('disconnecting', () => sCtrl.playerCleanup());

  socket.on(ce.JOIN_LOBBY, (...args) => wrap(sCtrl.joinLobby, args));
  socket.on(ce.CREATE_GAME, (...args) => wrap(sCtrl.createGame, args));
  socket.on(ce.JOIN_GAME, (...args) => wrap(sCtrl.joinGame, args));
  socket.on(ce.WRITE_PHRASE, (...args) => wrap(sCtrl.writePhrase, args));
}

export default registerSocket;
