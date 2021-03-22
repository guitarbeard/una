import { GAME_NAME, DEFAULT_PORT, APP_PRODUCTION } from "./config";
import ky from "ky"; // HTTP client I'm using (saw other people use it, looks like it works fine, and it's pretty simple to use)

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

// Make HTTP requests (HTTP method, URL endpoint: description) to boardgame.io Lobby REST API
export class LobbyAPI {
  // create a ky instance
  constructor() {
    this.api = ky.create({
      prefixUrl: `${SERVER_URL}/games/${GAME_NAME}`, // prefix to prepend to URL input
    });
  }

  // POST /games/{game_name}/create : create a match
  async createRoom(numPlayers, winsToEndGame) {
    try {
      const res = await this.api.post("create", { json: { numPlayers, setupData: {winsToEndGame} } }).json();
      return res.matchID;
    } catch (err) {
      console.log("failed to create room:", err);
    }
  }

  // POST /games/{game_name}/{room_id}/join : join a match
  async joinRoom(roomID, id, name) {
    try {
      const res = await this.api.post(roomID + "/join", { json: { playerID: id, playerName: name } }).json();
      const { playerCredentials } = res;
      return playerCredentials;
    } catch (err) {
      console.log("failed to join room:", err);
    }
  }

  // POST /games/{game_name}/{room_id}/join : join a match
  async playAgain(roomID, playerID, credentials, ) {
    try {
      const res = await this.api.post(roomID + "/playAgain", { json: { playerID, credentials } }).json();
      const { nextMatchID } = res;
      return nextMatchID;
    } catch (err) {
      console.log("failed to join room:", err);
    }
  }

  // POST /games/{game_name}/{room_id}/leave : leave a match
  async leaveRoom(roomID, id, playerCredentials) {
    try {
      await this.api.post(roomID + "/leave", { json: { playerID: id, credentials: playerCredentials } }).json();
    } catch (err) {
      console.log("failed to leave room:", err);
    }
  }

  // POST /games/{game_name}/{room_id}/join : join a match
  async updatePlayer(roomID, id, credentials, data) {
    try {
      await this.api.post(roomID + "/update", { json: { playerID: id, credentials, data } }).json();
    } catch (err) {
      console.log("failed to join room:", err);
    }
  }

  // GET /games/{game_name}/{room_id} : get specific match by its matchID
  async getPlayers(roomID) {
    const res = await this.api.get(roomID).json();
    return res.players;
  }

  // GET /games/{game_name}/{room_id} : get specific match by its matchID
  async getRoom(roomID) {
    const res = await this.api.get(roomID).json();
    return res;
  }

  /*----------------- TODO: actually use this request... e.g. show available rooms in the lobby ? -----------------*/

  // GET /games/{game_name} : return an array of all the games
  async getRooms() {
    const res = await this.api.get("").json();
    return res;
  }
}

const api = new LobbyAPI();

export { api };