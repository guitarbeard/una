import { INVALID_MOVE, ActivePlayers } from 'boardgame.io/core';
import { func } from 'prop-types';
import { GAME_NAME } from "../config";

const COLORS = ["blue", "green", "red", "yellow"];

function createDeck() {
  let cards = [];
  for(let color of COLORS){
    // 1x 0 and 2x 1-9
    for(let i=0;i<=9;i+=.5){
      cards.push({numberIndex: i, colorIndex: COLORS.indexOf(color), type:"regular", color, number:Math.ceil(i)});
    }
    
    // 2x each action card
    for(let i=0;i<2;i++){
      cards.push({numberIndex: 10, colorIndex: COLORS.indexOf(color), type:"reverse", color, number:"R"});
      cards.push({numberIndex: 11, colorIndex: COLORS.indexOf(color), type:"skip", color, number:">"});
      cards.push({numberIndex: 12, colorIndex: COLORS.indexOf(color), type:"draw2", color, number:"+2"});
    }

    // Wild cards once
    cards.push({numberIndex: 13, colorIndex: 4, type:"wild", color:"wild", number:"?"});
    // Wild+4 cards once
    cards.push({numberIndex: 13, colorIndex: 4, type:"wilddraw4", color:"wild", number:"+4"});
  }
  return cards;
}

function drawCards(G, ctx, cardAmount) {
  if (G.deck.length < cardAmount) {
    const deck = ctx.random.Shuffle(createDeck());
    G.deck = G.deck.concat(deck);
  }
  const cards = G.deck.splice(0, cardAmount);
  return cards;
}

function addCardsToPlayer(G, ctx, playerID, drawLength) {
  G.players[playerID].hand = G.players[playerID].hand.concat(drawCards(G, ctx, drawLength));
  G.players[playerID].calledUna = false;
}

function createPlayer(G, ctx, playerID) {
  G.players[playerID] = {
    hand: drawCards(G, ctx, 7),
    calledUna: false,
    wins: 0
  }
}

function canPlayCard(G, playerID, cardIndex) {
  return G.players[playerID].hand[cardIndex].color === 'wild' || G.players[playerID].hand[cardIndex].number === G.currentCard.number || G.players[playerID].hand[cardIndex].color === G.currentCard.color;
}

function canCallUna(G, ctx, playerID) {
  return (G.players[playerID].hand.length === 2 && playerID === ctx.currentPlayer) || G.players[playerID].hand.length < 2;
}

function isSkipCard(G, playedCard) {
  return playedCard.type === 'draw2' || playedCard.type === 'skip' || playedCard.type === 'wilddraw4' || (playedCard.type === 'reverse' && G.players.length === 2);
}

function getRandomColor(ctx) {
  return COLORS[ctx.random.Die(COLORS.length) - 1];
}

function getNextPlayerIndex(playOrderPos, G) {
  let nextPlayerIndex = (playOrderPos + 1) % G.players.length;
  if(G.reverse) {
    nextPlayerIndex = (playOrderPos === 0) ? (G.players.length - 1) : (playOrderPos - 1) ;
  }
  return nextPlayerIndex;
}

function createSetup(ctx) {
  let deck = ctx.random.Shuffle(createDeck());
  let currentCard = deck.pop();
  currentCard.color = currentCard.color === 'wild' ? getRandomColor(ctx) : currentCard.color;
  return {
    gameEnded: false,
    currentWinner: null,
    deck,
    players: [],
    currentCard,
    reverse: false,
    skipped: true
  };
}

export const Una = {
  name: `${GAME_NAME}`,
  minPlayers: 1,
  maxPlayers: 20,
  setup: createSetup,
  moves: {
    playerJoin: {
      move: (G, ctx, playerID) => {
        if (!G.players[playerID]) {
          createPlayer(G, ctx, playerID);
        }
      },
      client: false,
      noLimit: true
    },

    pass: {
      move: (G, ctx) => {
        ctx.events.pass();
      },
      client: false,
      noLimit: true
    },

    callUna: {
      move: (G, ctx, playerID) => {
        if (canCallUna(G, ctx, playerID)) {
          G.players[playerID].calledUna = true;
        } else {
          return INVALID_MOVE;
        }
      },
      client: false,
      noLimit: true
    },

    drawCard: {
      move: (G, ctx, playerID) => {
        let drawLength = G.players[playerID].hand.length ? 1 : 7;
        if (ctx.currentPlayer === playerID) {
          addCardsToPlayer(G, ctx, playerID, drawLength);
        } else {
          return INVALID_MOVE;
        }
      },
      client: false
    },

    punish: {
      move: (G, ctx, playerID) => {
        if (G.players.length && G.players[playerID].hand.length === 1) {
          addCardsToPlayer(G, ctx, playerID, 4);
        }
      },
      client: false,
      noLimit: true
    },
    
    playCard: {
      move: (G, ctx, playerID, cardIndex, color) => {
        if (canPlayCard(G, playerID, cardIndex)) {
          let playedCard = G.players[playerID].hand.splice(cardIndex, 1)[0];
          if (playedCard.color === 'wild') {
            playedCard.color = color ? color : getRandomColor(ctx);
          }
          if (isSkipCard(G, playedCard)) {
            G.skipped = true;
            if (playedCard.type === 'draw2') {
              const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, G);
              addCardsToPlayer(G, ctx, nextPlayerIndex, 2);
            }
            if (playedCard.type === 'wilddraw4') {
              const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, G);
              addCardsToPlayer(G, ctx, nextPlayerIndex, 4);
            }
          }
          if (playedCard.type === 'reverse') {
            G.reverse = !G.reverse;
          }
          G.currentCard = playedCard;
          if(ctx.currentPlayer !== playerID) {
            ctx.events.pass();
          }
        } else {
          return INVALID_MOVE;
        }
      },
      client: false
    }
  },

  turn: {
    moveLimit: 1,
    activePlayers: ActivePlayers.ALL,
    onBegin: (G, ctx) => {
      G.skipped = false;
    },
    onEnd: (G, ctx) => {
      if (G.players.length && !G.players[ctx.playOrderPos].hand.length && G.currentWinner === null) {
        G.currentWinner = ctx.playOrderPos;
        G.players[ctx.playOrderPos].wins++;
      }
      if (G.players.length && G.currentWinner !== null && G.players[G.currentWinner].hand.length) {
        G.currentWinner = null;
      }
    },
    order: {
      // Get the initial value of playOrderPos.
      // This is called at the beginning of the phase.
      first: (G, ctx) => 0,

      // Get the next value of playOrderPos.
      // This is called at the end of each turn.
      // The phase ends if this returns undefined.
      next: (G, ctx) => {
        const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, G);
        return G.skipped ? getNextPlayerIndex(nextPlayerIndex, G) : nextPlayerIndex;        
      }
    },
  }
};
