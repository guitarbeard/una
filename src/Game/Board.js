import React from 'react';

function getCardClass(color) {
  let cardClass = '';
    switch (color) {
      case 'blue':
        cardClass = 'is-primary';
        break;
      case 'red':
        cardClass = 'is-error';
        break;
      case 'green':
        cardClass = 'is-success';
        break;
      case 'yellow':
        cardClass = 'is-warning';
        break;
      default:
        cardClass = 'is-wild';
        break;
    }

    return cardClass;
}

function sortByNumber(a, b) {
  const compare = a.numberIndex - b.numberIndex;
  return compare;
}

function sortByColor(a, b) {
  const compare = a.colorIndex - b.colorIndex;
  return compare;
}

export default class Board extends React.Component {
  drawCard() {
    this.props.moves.drawCard(this.props.playerID);
  }

  playCard(index) {
    this.props.moves.playCard(this.props.playerID, index);
  }

  render() {
    const isYourTurn = this.props.ctx.currentPlayer === this.props.playerID;
    let yourTurn = '';

    if (isYourTurn) {
      yourTurn = <span><i className="nes-icon heart is-small"></i>Your Turn<i className="nes-icon heart is-small"></i></span>;
    } else {
      yourTurn = this.props.matchData[this.props.ctx.currentPlayer].name + "'s Turn"
    }

    let winner = '';
    if (this.props.ctx.gameover) {
      if (this.props.ctx.gameover.winner !== undefined) {
        winner = <h2 className="text-center">{this.props.matchData[this.props.ctx.gameover.winner].name} WINS!!!</h2>;
        if (isYourTurn) {
          yourTurn = <span><i className="nes-icon trophy is-small"></i>YOU WIN!!!<i className="nes-icon trophy is-small"></i></span>;
        } else {
          yourTurn = <span><i className="nes-icon close is-small"></i>YOU LOSE!!!<i className="nes-icon close is-small"></i></span>;
        }
      } else if(this.props.ctx.gameover.message !== undefined) {
        yourTurn = <span><i className="nes-icon heart is-empty is-small"></i>{this.props.ctx.gameover.message}<i className="nes-icon heart is-empty is-small"></i></span>;
      }      
    }

    let hand = [];
    hand = this.props.G.players[this.props.playerID].hand.slice().map((card, index) => {
      return {
        originalIndex: index,
        numberIndex: card.numberIndex,
        colorIndex: card.colorIndex,
        type: card.type,
        color: card.color,
        number: card.number
      };
    });
    hand.sort(sortByNumber).sort(sortByColor);
    return (
      <main>
        <div className="container">
          {winner}
          <div className="nes-container with-title">
            <p className={`title ${isYourTurn ? 'nes-text is-error' : ''}`}>{yourTurn}</p>
            {this.props.matchData.map((player, index) => <span key={index} className="nes-badge"><span className={parseInt(this.props.ctx.currentPlayer) === index ? 'is-success' : 'is-primary'}>{player.name}</span></span>)}
          </div>
          <div className="text-center">
            <button className="nes-btn card deck mb mt" onClick={() => this.drawCard()}><span><span>DRAW</span><br/>{this.props.G.deck.length}</span></button>
            <div className={`discard card nes-btn mb mt ${getCardClass(this.props.G.currentCard.color)}`}><span>{this.props.G.currentCard.number}</span></div>
          </div>
          <hr/>
          <div className="hand-wrap">
              {hand.map((card, index) => <button key={index} className={`card nes-btn mb ${getCardClass(card.color)}`} onClick={() => this.playCard(card.originalIndex)}><span>{card.number}</span></button>)}
          </div> 
        </div>
      </main>
      
    );
  }
}