# Hangman WebSocket API

This is a WebSocket API for a multiplayer Hangman game built with React. The API manages game creation, player matching, and game state across multiple language modes.

## Overview

The API uses Socket.IO to create a multiplayer game experience where players take turns guessing each other's phrases in a Hangman-style game.

## Environment Variables

The API requires the following environment variables:

- `PORT`: Port number the server is listening on
- `HOSTNAME`: Hostname the server is listening on
- `REDIRECT_URL`: URL to redirect HTTP requests
- `ORIGIN`: Allowed origin for CORS
- `SOCKET_PATH`: Path for Socket.IO connections

## Game Flow

1. Player connects and joins a language-specific lobby
2. Player can create a new game or join an existing one
3. When two players join the same game, both are prompted to submit phrases
4. Once both phrases are submitted, the game starts with each player trying to guess the other's phrase
5. After guessing, game statistics are updated
6. Players can continue to play multiple rounds

## WebSocket Events

### Client to Server Events

| Event          | Parameters        | Description                                     |
| -------------- | ----------------- | ----------------------------------------------- |
| `join-lobby`   | none              | Joins a language-specific lobby                 |
| `create-game`  | `name` (string)   | Creates a new game with the specified name      |
| `join-game`    | `id` (string)     | Joins an existing game by ID                    |
| `write-phrase` | `phrase` (string) | Submits a phrase for the opponent to guess      |
| `end-round`    | `phrase` (string) | Ends the current game with the guessed phrase   |
| `next-round`   | none              | Signals readiness to continue to the next round |

### Server to Client Events

| Event              | Data                             | Description                                               |
| ------------------ | -------------------------------- | --------------------------------------------------------- |
| `game-list`        | `{id, name}[]`                   | List of available games in the lobby                      |
| `wait-start`       | none                             | Notifies player to wait for opponent or phrase submission |
| `give-phrase`      | none                             | Prompts player to submit a phrase                         |
| `start-game`       | `phrase` (string)                | Starts the game with the opponent's phrase to guess       |
| `game-data`        | `{wins, rounds, oWins, oRounds}` | Updates game statistics after each round                  |
| `opponent-exit`    | none                             | Notifies when opponent disconnects                        |
| `old-version`      | none                             | Warns client their version is outdated                    |
| `unsupported-lang` | none                             | Indicates the requested language is not supported         |
