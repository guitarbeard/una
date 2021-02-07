import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { UnaBoard } from './Board';
import { Una } from './Game';
import { JoinOrCreate } from './JoinOrCreate';

const UnaClient = Client({
  game: Una,
  board: UnaBoard,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
});

const App = () => {
  const [playerID, setPlayerID] = useState(null);
  const [matchID, setMatchID] = useState(null);
  if (playerID === null || matchID === null) {
    return <JoinOrCreate setPlayerID={setPlayerID} setMatchID={setMatchID} />;
  }
  return (
    <div>
      {playerID}
      <UnaClient playerID={playerID} matchID={matchID} />
    </div>
  );
};

export default App;