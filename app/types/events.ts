enum ClientEvents {
  JOIN_LOBBY = 'join-lobby',
  CREATE_GAME = 'create-game',
  JOIN_GAME = 'join-game',
  WRITE_PHRASE = 'write-phrase',
  END_ROUND = 'end-round',
  NEXT_ROUND = 'next-round',
}

enum ServerEvents {
  GAME_LIST = 'game-list',
  WAIT_START = 'wait-start',
  GIVE_PHRASE = 'give-phrase',
  START_GAME = 'start-game',
  GAME_DATA = 'game-data',
  OPPONENT_EXIT = 'opponent-exit',
  OLD_VERSION = 'old-version',
  UNSUPPORTED_LANG = 'unsupported-lang',
  INVALID_DATA = 'invalid-data',
}

export { ClientEvents, ServerEvents };
