const { Server } = require('boardgame.io/server');
const { Una } = require('./Game');

const server = Server({ games: [Una] });

server.run(8000);