import { INVALID_MOVE } from 'boardgame.io/core';
import { GAME_NAME } from "../config";

const COLORS = ["blue","green","yellow","red"];

function createDeck(deckLength) {
  const cards = [];
  for (let index = 0; index < deckLength; index++) {
    for(let color of COLORS){
      // 1x 0 and 2x 1-9
      for(let i=0;i<=9;i+=.5){
        cards.push({type:"regular", color, number:Math.ceil(i)});
      }
      
      // 2x each action card
      for(let i=0;i<2;i++){
        cards.push({type:"skip", color, number:">"});
        cards.push({type:"reverse", color, number:"R"});
        cards.push({type:"draw2", color, number:"+2"});
      }

      // Wild cards once
      cards.push({type:"wild", color:"wild", number:"?"});
      // Wild+4 cards once
      cards.push({type:"wilddraw4", color:"wild", number:"+4"});
    }
  }
  return cards;
}

function createPlayers(numPlayers, deck) {
  const players = [];
  for (let i = 0; i < numPlayers; ++i) {
    players.push({
      name: "",
      hand: deck.splice(0, 7),
      id: `${i}`,
    });
  }
  return players;
}

function createSetup(ctx) {
  let deck = ctx.random.Shuffle(createDeck(1));
  const players =  createPlayers(ctx.numPlayers, deck);
  const currentCard = deck.pop();

  return {
    deck,
    players,
    currentCard
  };
}


export const Una = {
  name: `${GAME_NAME}`,
  minPlayers: 2,
  maxPlayers: 8,
  setup: createSetup,
  moves: {
    drawCard: (G, ctx, playerID) => {
      let card = G.deck.pop();
      G.players[playerID].hand.push(card);
    },

    playCard: (G, ctx, playerID, cardIndex) => {
      if (G.players[playerID].hand[cardIndex].color === 'wild' || G.players[playerID].hand[cardIndex].number === G.currentCard.number || G.players[playerID].hand[cardIndex].color === G.currentCard.color) {
        let playedCard = G.players[playerID].hand.splice(cardIndex, 1)[0];
        if (playedCard.color === 'wild') {
          playedCard.color = COLORS[ctx.random.Die(COLORS.length) - 1];
        }
        G.currentCard = playedCard;
      } else {
        return INVALID_MOVE;
      }
    },
  },

  turn: {
    moveLimit: 1,
  },

  endIf: (G, ctx) => {
    if (!G.players[ctx.currentPlayer].hand.length) {
      return { winner: ctx.currentPlayer };
    }
    if (!G.deck.length) {
      return 'Out of Cards';
    }
  },
};
