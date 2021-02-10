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

function getNextPlayerIndex(playOrderPos, numPlayers, reverse) {
  let nextPlayerIndex = (playOrderPos + 1) % numPlayers;
  if(reverse) {
    nextPlayerIndex = (playOrderPos === 0) ? (numPlayers - 1) : (playOrderPos - 1) ;
  }
  return nextPlayerIndex;
}

function createSetup(ctx) {
  let deck = ctx.random.Shuffle(createDeck(1));
  const players =  createPlayers(ctx.numPlayers, deck);
  const currentCard = deck.pop();

  return {
    deck,
    players,
    currentCard,
    reverse: false,
    skipped: true
  };
}

export const Una = {
  name: `${GAME_NAME}`,
  minPlayers: 2,
  maxPlayers: 8,
  setup: createSetup,
  moves: {
    drawCard: (G, ctx, playerID) => {
      if (G.deck.length) {
        let card = G.deck.pop();
        G.players[playerID].hand.push(card);
      } else {
        return INVALID_MOVE;
      }
    },

    playCard: (G, ctx, playerID, cardIndex) => {
      if (G.players[playerID].hand[cardIndex].color === 'wild' || G.players[playerID].hand[cardIndex].number === G.currentCard.number || G.players[playerID].hand[cardIndex].color === G.currentCard.color) {
        let playedCard = G.players[playerID].hand.splice(cardIndex, 1)[0];
        if (playedCard.color === 'wild') {
          playedCard.color = COLORS[ctx.random.Die(COLORS.length) - 1];
        }
        if (playedCard.type === 'draw2' || playedCard.type === 'skip' || playedCard.type === 'wilddraw4') {
          G.skipped = true;
          if (playedCard.type === 'draw2') {
            const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, ctx.numPlayers, G.reverse);
            let cards = G.deck.splice(0, G.deck.length >= 2 ? 2 : G.deck.length);
            G.players[nextPlayerIndex].hand = G.players[nextPlayerIndex].hand.concat(cards);
          }
          if (playedCard.type === 'wilddraw4') {
            const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, ctx.numPlayers, G.reverse);
            let cards = G.deck.splice(0, G.deck.length >= 4 ? 4 : G.deck.length);
            G.players[nextPlayerIndex].hand = G.players[nextPlayerIndex].hand.concat(cards);
          }
        }
        if (playedCard.type === 'reverse') {
          G.reverse = !G.reverse;
        }
        G.currentCard = playedCard;
      } else {
        return INVALID_MOVE;
      }
    },
  },

  turn: {
    moveLimit: 1,
    // activePlayers: ActivePlayers.ALL,
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
        const nextPlayerIndex = getNextPlayerIndex(ctx.playOrderPos, ctx.numPlayers, G.reverse);
        return G.skipped ? getNextPlayerIndex(nextPlayerIndex, ctx.numPlayers, G.reverse) : nextPlayerIndex;        
      }
    },
  },

  endIf: (G, ctx) => {
    if (!G.players[ctx.currentPlayer].hand.length) {
      return { winner: ctx.currentPlayer };
    }
    if (!G.deck.length) {
      return { message: 'Out of Cards' };
    }
  },
};
