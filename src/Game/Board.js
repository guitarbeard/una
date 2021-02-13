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
    if (this.props.ctx.currentPlayer === this.props.playerID) {
      this.props.moves.drawCard(this.props.playerID);
    }
  }

  playCard(index, card) {
    if (this.props.ctx.currentPlayer === this.props.playerID || (card.color === this.props.G.currentCard.color && card.type === this.props.G.currentCard.type && card.number === this.props.G.currentCard.number)) {
      this.props.moves.playCard(this.props.playerID, index);
    }
  }

  callUna() {
    this.props.moves.callUna(this.props.playerID);
  }

  punish(playerID) {
    if (!this.props.G.players[playerID].calledUna && this.props.G.players[playerID].hand.length === 1) {
      this.props.moves.punish(playerID);
    }
  }

  render() {
    const isYourTurn = this.props.ctx.currentPlayer === this.props.playerID;
    let yourTurn = '';

    if (isYourTurn) {
      yourTurn = <span>{this.props.G.reverse ? '< ' : ''}<i className="nes-icon heart is-small"></i>Your Turn<i className="nes-icon heart is-small"></i>{this.props.G.reverse ? '' : ' >'}</span>;
    } else {
      yourTurn = <span>{this.props.G.reverse ? '< ' : ''}{this.props.matchData[this.props.ctx.currentPlayer].name}'s Turn{this.props.G.reverse ? '' : ' >'}</span>
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
        winner = <h2 className="text-center">DRAW</h2>;
        yourTurn = <span><i className="nes-icon heart is-empty is-small"></i>{this.props.ctx.gameover.message}<i className="nes-icon heart is-empty is-small"></i></span>;
      }      
    }

    let hand = [];
    hand = this.props.G.players[this.props.playerID].hand.map((card, index) => {
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
            {this.props.matchData.map((player, index) => <button key={index} onClick={() => this.punish(index)} className={this.props.G.players[index].calledUna ? 'called-una nes-badge is-splited' : 'nes-badge is-splited'}><span className={player.isConnected ? (parseInt(this.props.ctx.currentPlayer, 10) === index ? 'is-error' : 'is-primary'): 'is-dark'}>{player.name}</span><span className="is-dark">{this.props.G.players[index].hand.length}</span></button>)}
          </div>
          <div className="text-center">
            <button className="nes-btn card deck mb mt" onClick={() => this.drawCard()}><span><span>DRAW</span><br/>{this.props.G.deck.length}</span></button>
            <div className={`discard card nes-btn mb mt ${getCardClass(this.props.G.currentCard.color)}`}><span>{this.props.G.currentCard.number}</span></div>
          </div>
          <hr/>
          <div className="hand-wrap">
              {hand.map((card, index) => <button key={index} className={`card nes-btn mb ${getCardClass(card.color)}`} onClick={() => this.playCard(card.originalIndex, card)}><span>{card.number}</span></button>)}
          </div> 
        </div>
        <button id="call-una" className="nes-btn is-success" onClick={() => this.callUna()}>U</button>
      </main>
      
    );
  }
}