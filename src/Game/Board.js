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

export default class Board extends React.Component {
  drawCard() {
    this.props.moves.drawCard(this.props.playerID);
  }

  playCard(index) {
    this.props.moves.playCard(this.props.playerID, index);
  }

  render() {
    let yourTurn = '';
    if (this.props.ctx.currentPlayer === this.props.playerID) {
      yourTurn = 'Your Turn';
    } else {
      yourTurn = this.props.matchData[this.props.ctx.currentPlayer].name + "'s Turn"
    }

    let winner = '';
    if (this.props.ctx.gameover) {
      if (this.props.ctx.gameover.winner !== undefined) {
        winner = <h2 className="text-center">{this.props.matchData[this.props.ctx.gameover.winner].name} WINS!!!</h2>;
        if (this.props.ctx.currentPlayer === this.props.playerID) {
          yourTurn = 'YOU WIN!!!';
        } else {
          yourTurn = 'YOU LOSE!!!';
        }
      } else if(this.props.ctx.gameover.message !== undefined) {
        yourTurn = this.props.ctx.gameover.message;
      }      
    }

    let hand = [];
    if (this.props.G.players[this.props.playerID]) {
      hand = this.props.G.players[this.props.playerID].hand;
    }

    return (
      <main>
        <div className="container">
          {winner}
          <div className="nes-container with-title">
            <p className="title">{yourTurn}</p>
            {this.props.matchData.map((player, index) => <span key={index} className="nes-badge"><span className={parseInt(this.props.ctx.currentPlayer) === index ? 'is-success' : 'is-primary'}>{player.name}</span></span>)}
          </div>
          <div className="text-center">
            <button className="nes-btn card deck mb mt" onClick={() => this.drawCard()}><span><span>DRAW</span><br/>{this.props.G.deck.length}</span></button>
            <div className={`discard card nes-btn mb mt ${getCardClass(this.props.G.currentCard.color)}`}><span>{this.props.G.currentCard.number}</span></div>
          </div>
          <hr/>
          <div className="hand-wrap">
              {hand.map((card, index) => <button key={index} className={`card nes-btn mb ${getCardClass(card.color)}`} onClick={() => this.playCard(index)}><span>{card.number}</span></button>)}
          </div> 
        </div>
      </main>
      
    );
  }
}