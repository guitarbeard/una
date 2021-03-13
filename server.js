// from boardgame.io guide for Deployment to Heroku of Frontend and Backend
import { Server } from "boardgame.io/server";
import { Una } from "./src/Game/Game";
import path from "path";
import serve from "koa-static";
import { DEFAULT_PORT } from "./src/config";

const en = require("nanoid-good/locale/en");
const customAlphabet = require("nanoid-good").customAlphabet(en);

const server = Server({
  games: [Una],
  uuid: customAlphabet("ABCDEFGHJKMNOPQRSTUVWXYZ0123456789", 4)
});

const PORT = process.env.PORT || DEFAULT_PORT;

// build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, "./build");
server.app.use(serve(frontEndAppBuildPath));

server.run({
  port: PORT,
  callback: () => {
    server.app.use(
      async (ctx, next) => await serve(frontEndAppBuildPath)(Object.assign(ctx, { path: "index.html" }), next)
    );
  }
});