import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { DEFAULT_PORT, APP_PRODUCTION } from "../../config";
import { Una, Board } from "../../Game";
import Lobby from "../Lobby/Lobby";
import { api } from "../../LobbyAPI";

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

const UnaClient = Client({
  game: Una,
  board: Board,
  debug: false,
  multiplayer: SocketIO({ server: SERVER_URL }),
});

const Room = (props) => {
  const { history } = props;
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState([]);
  const [winsToEndGame, setWinsToEndGame] = useState('');
  const [show, setShow] = useState(false);

  // check for newly joined players by comparing against the two players array (front-end and the api, and api is always slightly ahead)
  useEffect(() => {
    const interval = setInterval(() => {
      api.getRoom(id).then(
        (room) => {
          setPlayers(room.players);
          setWinsToEndGame(room.setupData.winsToEndGame);
          if (room.players[0].hasOwnProperty('data') && room.players[0].data.gameStarted) {
            setShow(true);
          }
        },
        () => {
          history.push("", { invalidRoom: true }); // failed to join because room doesn't exist -> return user to homepage
        }
      );
    }, 500);
    if (show) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [show, players.length, id, history]);

  // after user copies to clipboard
  useEffect(() => {
    let timeout;
    if (copied) {
      timeout = setTimeout(() => {
        if (document.getSelection().toString() === id) {
          document.getSelection().removeAllRanges();
        }
        setCopied(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [copied, id]);

  const copyToClipboard = (e) => {
    const roomID = document.getElementById("roomID");
    roomID.select();
    document.execCommand("copy");
    e.target.focus();
    setCopied(true);
  };

  const leaveRoom = () => {
    api.leaveRoom(id, localStorage.getItem("id"), localStorage.getItem("credentials")).then(() => {
      history.push("/");
    });
  };

  const startGame = () => {
    api.updatePlayer(id, localStorage.getItem("id"), localStorage.getItem("credentials"), {gameStarted: true});
  };

  if (show) {
    // don't include lobby
    return (
      <UnaClient
        matchID={id}
        numPlayers={players.length}
        playerID={localStorage.getItem("id")}
        credentials={localStorage.getItem("credentials")}
      />
    );
  } else {
    return (
      <Lobby>
        <section>
          <div className="row">
            <div className="col s12">
              <h2 className="cyan-text">Waiting Room</h2>
              <p className="mb">Max Players: {players.length}</p>
              <p className="mb">Wins to End Game: {winsToEndGame}</p>
            </div>
            <div className="input-field col s12">
              <input
                id="roomID"
                type="text"
                value={`${origin}/join/${id}`}
                readOnly
              />
              <label className="active" htmlFor="roomID">Join URL</label>
            </div>
            <div className="col s12">
              <button
                className={copied ? 'btn disabled' : 'btn waves-effect waves-light cyan'}
                onClick={copyToClipboard}
                disabled={copied}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="col s12 mt">
              <ul>
                {players.map((player, index) => {
                  if (player.name) {
                    return <li key={index}><div className="chip"><span>{player.name}{player.name === localStorage.getItem("name") ? " (You)" : ""}</span></div></li>;
                  } else {
                    return '';
                  }
                })}
              </ul>
            </div>
            <div className="col s12 mt">
              {localStorage.getItem("id") === "0" ? <button className="btn waves-effect waves-light cyan mr" onClick={startGame}>Start Game</button> : ''}
              <button className="btn waves-effect waves-light red" onClick={leaveRoom}>
                Leave
              </button>
            </div>
          </div>          
        </section>
      </Lobby>
    );
  }
};

export default Room;