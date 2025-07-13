import SocketController from '@/controllers/socket.ts';
import SocketType from '@/types/sioSocket.ts';
import { ClientEvents as ce, ServerEvents as se } from '@/types/events.ts';
import ok from '@/utils/validators.ts';
import queryVariables from '@/types/queryVariables.ts';

function registerSocket(socket: SocketType) {
  function wrap<AT extends readonly unknown[]>(
    listener: (...args: AT) => void,
    args: AT,
  ) {
    try {
      return listener.bind(sCtrl)(...args);
    } catch (err) {
      socket.emit(se.INVALID_DATA);
      console.warn(err instanceof Error ? err.message : err);
    }
  }

  try {
    ok.version(socket.handshake.query.get(queryVariables.FRONT_VERSION));
  } catch {
    socket.emit(se.OLD_VERSION);
    return;
  }
  try {
    ok.langCode(socket.handshake.query.get(queryVariables.LANG_CODE));
  } catch {
    socket.emit(se.UNSUPPORTED_LANG);
    return;
  }

  const sCtrl = new SocketController(socket);

  socket.on('disconnecting', () => sCtrl.playerCleanup());

  socket.on(ce.JOIN_LOBBY, (...args) => wrap(sCtrl.joinLobby, args));
  socket.on(ce.CREATE_GAME, (...args) => wrap(sCtrl.createGame, args));
  socket.on(ce.JOIN_GAME, (...args) => wrap(sCtrl.joinGame, args));
  socket.on(ce.WRITE_PHRASE, (...args) => wrap(sCtrl.writePhrase, args));
  socket.on(ce.END_ROUND, (...args) => wrap(sCtrl.endRound, args));
  socket.on(ce.NEXT_ROUND, (...args) => wrap(sCtrl.nextRound, args));
}

export default registerSocket;
