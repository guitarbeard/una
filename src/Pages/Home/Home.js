import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Lobby from "../Lobby/Lobby";
import { api } from "../../LobbyAPI";

const Home = (props) => {
  const { history } = props;
  const { joinID } = useParams();
  const jNameInputRef = useRef();
  const maxNameLength = 12;
  const roomIDLength = 4;

  const [room, setRoom] = useState("");
  const [jName, setJName] = useState("");
  const jNameCount = maxNameLength - jName.length;
  const [num, setNum] = useState("");
  const [cName, setCName] = useState("");
  const cNameCount = maxNameLength - cName.length;
  const [errMsg, setErrMsg] = useState("");

  // handle URL to a room that doesn't exist
  useEffect(() => {
    if (joinID) {
      jNameInputRef.current.focus();
    }

    let timer;
    if (history.location.state && history.location.state.invalidRoom) {
      setErrMsg("room does not exist!");
      // reset error message
      timer = setTimeout(() => {
        setErrMsg("");
        history.replace();
      }, 4000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [history, joinID]);

  // restrict inputs, specifically spaces (inspired by https://secret-hitler.online/)
  const handleKeyDown = (e, text) => {
    if (e.key === " ") {
      if (text) {
        if (text.length === 0 || text.substring(text.length - 1, text.length) === " ") {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    }
  };

  // store user information to localStorage to use later when we arrive at the room
  const saveInfo = (name, id, credentials) => {
    localStorage.setItem("name", name);
    localStorage.setItem("id", id);
    localStorage.setItem("credentials", credentials);
  };

  const joinRoom = async (roomID, name) => {
    try {
      const players = await api.getPlayers(roomID);
      const uniqueName =
        players
          .filter((player) => player.name)
          .map((player) => player.name)
          .indexOf(name) === -1;
      if (uniqueName) {
        // find first empty seat
        const id = players.find((player) => !player.name).id;
        api.joinRoom(roomID, id, name).then((credentials) => {
          saveInfo(name, id, credentials);
          history.push("/rooms/" + roomID);
        });
      } else {
        // handle name conflict error
        setErrMsg("name already taken!");
        setJName("");
        document.getElementById("joinName").value = "";
      }
    } catch (err) {
      /*
       * --- TO-DO: setErrMsg("room is full") here if that's the case. currently it's "room does not exist" in both cases ---
       */
      setErrMsg("room does not exist!");
      setRoom("");
      document.getElementById("roomIdentification").value = "";
    }
  };

  const createRoom = (e) => {
    e.preventDefault();
    api.createRoom(num).then((roomID) => {
      joinRoom(roomID, cName);
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    joinRoom(joinID ? joinID : room.toUpperCase(), jName);
  };

  return (
    <Lobby>
      <section>
        <form onSubmit={handleJoinRoom}>
          <h2>Join Game</h2>
          <div className="nes-field">
            <label htmlFor="roomIdentification">Room ID</label>
            <input
              id="roomIdentification"
              type="text"
              maxLength={`${roomIDLength}`}
              spellCheck="false"
              autoComplete="off"
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => setRoom(e.target.value)}
              value={joinID ? joinID : room}
              className="nes-input"
            />
          </div>
          <div className="nes-field">
            <label htmlFor="join-name">Username {jNameCount}</label>
            <input
              id="join-name"
              type="text"
              maxLength={`${maxNameLength}`}
              spellCheck="false"
              autoComplete="off"
              onKeyDown={(e) => handleKeyDown(e, jName)}
              onChange={(e) => setJName(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              ref={jNameInputRef}
              className="nes-input"
            />
          </div>
          <button
            type="submit"
            className={`nes-btn ${((room.length !== roomIDLength && !joinID) || jName.length === 0) ? 'is-disabled' : 'is-primary'}`}
            disabled={(room.length !== roomIDLength && !joinID) || jName.length === 0}
          >
            Join
          </button>
          <div className="nes-text is-error mt">{errMsg}</div>
        </form>
      </section>
      <section>
        <form onSubmit={createRoom}>
          <h2>Create Game</h2>
          <label htmlFor="number-of-players"># of players: {num}</label>
          <div className="nes-select">
            <select id="number-of-players" value={num} onChange={(e) => setNum(e.target.value)}>
              <option value="" disabled hidden>Select...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
          <div className="nes-field">
            <label htmlFor="create-name">Username {cNameCount}</label>
            <input
              id="create-name"
              type="text"
              maxLength={`${maxNameLength}`}
              spellCheck="false"
              autoComplete="off"
              onKeyDown={(e) => handleKeyDown(e, cName)}
              onChange={(e) => setCName(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              className="nes-input"
            />
          </div>
          <button
            type="submit"
            className={`nes-btn ${cName.length === 0 ? 'is-disabled' : 'is-primary'}`}
            disabled={cName.length === 0}
          >
            Create
          </button>
        </form>
      </section>
    </Lobby>
  );
};

export default Home;