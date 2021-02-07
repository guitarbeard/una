import React from 'react';
import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

export class Lobby extends React.Component {
  render() {
    

    return (
      <h1>
        Lobby
      </h1>
    );
  }
}