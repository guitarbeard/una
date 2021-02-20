import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import classNames from "classnames";
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
  const [show, setShow] = useState(false);

  // check for newly joined players by comparing against the two players array (front-end and the api, and api is always slightly ahead)
  useEffect(() => {
    const interval = setInterval(() => {
      api.getPlayers(id).then(
        (players) => {
          setPlayers(players);
          if (players[0].hasOwnProperty('data') && players[0].data.gameStarted) {
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
          <h2>Waiting Room</h2>
          <div className="nes-container with-title">
            <p className="title">Invite Your Friends</p>
            <p className="mb">Max Players: 20</p>
            <div className="nes-field">
              <label htmlFor="roomID">Join URL</label>
              <input type="text" className="nes-input" id="roomID" value={`${origin}/join/${id}`} readOnly />
            </div>
            <button
              className={classNames("nes-btn", { "is-disabled": copied })}
              onClick={copyToClipboard}
              disabled={copied}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="players-list mt mb">
            {players.map((player, index) => {
              if (player.name) {
                return <span key={index} className="nes-badge"><span className="is-primary">{player.name}{player.name === localStorage.getItem("name") ? " (You)" : ""}</span></span>;
              } else {
                return '';
              }
            })}
          </div>
          <div>
            {localStorage.getItem("id") === "0" ? <button className="nes-btn is-primary mr" onClick={startGame}>Start Game</button> : ''}
            <button className="nes-btn is-error" onClick={leaveRoom}>
              Leave
            </button>
          </div>
        </section>
      </Lobby>
    );
  }
};

export default Room;