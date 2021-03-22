import { INVALID_MOVE, ActivePlayers } from 'boardgame.io/core';
import { GAME_NAME } from "../config";

const COLORS = ["blue", "green", "red", "yellow"];

function createDeck(deckSize) {
  let cards = [];
  for (let index = 0; index < deckSize; index++) {
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
  }
  return cards;
}

function drawCards(G, ctx, cardAmount) {
  if (G.deck.length < cardAmount) {
    const deck = ctx.random.Shuffle(createDeck(3));
    G.deck = G.deck.concat(deck);
  }
  const cards = G.deck.splice(0, cardAmount);
  return cards;
}

function getPlayer(G, playerID) {
  return G.players.find(player => parseInt(player.id, 10) === parseInt(playerID, 10));
}

function playerHasWonGame(G) {
  return G.players.find(player => (G.winsToEndGame === '∞' ? false : player.wins === parseInt(G.winsToEndGame, 10)));
}

function addCardsToPlayer(G, ctx, playerID, drawLength) {
  getPlayer(G, playerID).hand = getPlayer(G, playerID).hand.concat(drawCards(G, ctx, drawLength));
  getPlayer(G, playerID).calledUna = false;
}

function createPlayer(G, ctx, playerID) {
  if (typeof(getPlayer(G, playerID)) === 'undefined') {
    G.players.push({
      id: playerID,
      hand: drawCards(G, ctx, 7),
      calledUna: false,
      wins: 0
    });
  }
}

function gameHasEnded(G) {
  return G.winnerID === '' ? false : true;
}

function canPlayCard(G, playerID, cardIndex) {
  return getPlayer(G, playerID).hand[cardIndex].color === 'wild' || getPlayer(G, playerID).hand[cardIndex].number === G.currentCard.number || getPlayer(G, playerID).hand[cardIndex].color === G.currentCard.color;
}

function canCallUna(G, ctx, playerID) {
  return (getPlayer(G, playerID).hand.length === 2 && playerID === ctx.currentPlayer) || getPlayer(G, playerID).hand.length < 2;
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

function createSetup(ctx, setupData) {
  let deck = ctx.random.Shuffle(createDeck(3));
  let currentCard = deck.pop();
  currentCard.color = currentCard.color === 'wild' ? getRandomColor(ctx) : currentCard.color;
  return {
    deck,
    players: [],
    currentCard,
    reverse: false,
    skipped: true,
    winsToEndGame: setupData.winsToEndGame,
    nextMatchID: '',
    winnerID: '' 
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
        if (typeof(getPlayer(G, playerID)) === 'undefined') {
          createPlayer(G, ctx, playerID);
        } else {
          return INVALID_MOVE;
        }
      },
      client: false,
      noLimit: true,
      // Allow simultaneous moves (everyone is trying to join at once): https://github.com/boardgameio/boardgame.io/issues/828
      ignoreStaleStateID: true
    },

    pass: {
      move: (G, ctx) => {
        if (!gameHasEnded(G)) {
          ctx.events.pass();
        } else {
          return INVALID_MOVE;
        }
      },
      client: false,
      noLimit: true
    },

    callUna: {
      move: (G, ctx, playerID) => {
        if (!gameHasEnded(G) && canCallUna(G, ctx, playerID)) {
          getPlayer(G, playerID).calledUna = true;
        } else {
          return INVALID_MOVE;
        }
      },
      client: false,
      noLimit: true
    },

    endGame: {
      move: (G, ctx, nextMatchID) => {
        G.nextMatchID = nextMatchID;
      },
      client: false,
      noLimit: true
    },

    drawCard: {
      move: (G, ctx, playerID) => {
        if(!gameHasEnded(G)) {
          let drawLength = getPlayer(G, playerID).hand.length ? 1 : 7;
          if (ctx.currentPlayer === playerID) {
            addCardsToPlayer(G, ctx, playerID, drawLength);
          } else {
            return INVALID_MOVE;
          }
        } else {
          return INVALID_MOVE;
        }
      },
      client: false
    },

    punish: {
      move: (G, ctx, playerID) => {
        if (!gameHasEnded(G) && G.players.length && getPlayer(G, playerID).hand.length === 1) {
          addCardsToPlayer(G, ctx, playerID, 4);
        } else {
          return INVALID_MOVE;
        }
      },
      client: false,
      noLimit: true
    },
    
    playCard: {
      move: (G, ctx, playerID, cardIndex, color) => {
        if (!gameHasEnded(G) && canPlayCard(G, playerID, cardIndex)) {
          let playedCard = getPlayer(G, playerID).hand.splice(cardIndex, 1)[0];
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
          if (!getPlayer(G, playerID).hand.length) {
            getPlayer(G, playerID).wins++;
          }
          if(ctx.currentPlayer !== playerID) {
            ctx.events.pass();
          }
          var winner = playerHasWonGame(G);
          if (winner) {
            G.winnerID = winner.id;
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
