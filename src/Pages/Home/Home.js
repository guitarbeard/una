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
  const numPlayers = 20;

  const [room, setRoom] = useState("");
  const joinIDCount = joinID ? joinID.length : room.length;
  const [jName, setJName] = useState("");
  const jNameCount = jName.length;
  const [cName, setCName] = useState("");
  const cNameCount = cName.length;
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
    api.createRoom(numPlayers).then((roomID) => {
      joinRoom(roomID, cName);
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    joinRoom(joinID ? joinID.toUpperCase() : room.toUpperCase(), jName);
  };

  return (
    <Lobby>
      <div className="row">
        <form className="col s12"onSubmit={handleJoinRoom}>
            <h2 className="cyan-text">Join</h2>
            <div className="row">
                <div className="input-field col s12">                    
                    <input
                      id="roomIdentification"
                      type="text"
                      maxLength={`${roomIDLength}`}
                      spellCheck="false"
                      autoComplete="off"
                      onKeyDown={(e) => handleKeyDown(e)}
                      onChange={(e) => setRoom(e.target.value)}
                      value={joinID ? joinID : room}
                      placeholder="****"
                    />
                    <label className="active" htmlFor="roomIdentification">Room ID</label>
                    <span className="character-counter">{joinIDCount}/4</span>
                </div>
            </div>
            <div className="row">
                <div className="input-field col s12">
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
                      placeholder="Your Name"
                    />
                    <label className="active" htmlFor="join-name">Username</label>
                    <span className="character-counter">{jNameCount}/12</span>
                </div>
            </div>
            <button
              type="submit"
              className={((room.length !== roomIDLength && !joinID) || jName.length === 0) ? 'btn disabled' : 'btn waves-effect waves-light cyan'}
              disabled={(room.length !== roomIDLength && !joinID) || jName.length === 0}
            >
              Join
            </button>
            <p className="red-text">{errMsg}</p>
        </form>
    </div>
    <div className="row">
        <form className="col s12" onSubmit={createRoom}>
            <h2 className="cyan-text">Create</h2>
            <p><small>Max Players: 20</small></p>
            <div className="row">
                <div className="input-field col s12">
                  <input
                    id="create-name"
                    type="text"
                    maxLength={`${maxNameLength}`}
                    spellCheck="false"
                    autoComplete="off"
                    onKeyDown={(e) => handleKeyDown(e, cName)}
                    onChange={(e) => setCName(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    placeholder="Your Name"
                  />
                  <label className="active" htmlFor="create-name">Username</label>
                  <span className="character-counter">{cNameCount}/12</span>
                </div>
            </div>
            <button
              type="submit"
              className={cName.length === 0 ? 'btn disabled' : 'btn waves-effect waves-light cyan'}
              disabled={cName.length === 0}
            >
              Create
            </button>
        </form>
      </div>
    </Lobby>
  );
};

export default Home;