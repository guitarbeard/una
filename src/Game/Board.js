import React from 'react';

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
      yourTurn = <div><strong>YOUR TURN</strong></div>;
    }

    let winner = '';
    console.log(this.props.matchData);
    if (this.props.ctx.gameover) {
      if (this.props.ctx.gameover.winner !== undefined) {
        winner = <div>{this.props.matchData[this.props.ctx.gameover.winner].name} WINS!!!</div>;
        if (this.props.ctx.currentPlayer === this.props.playerID) {
          yourTurn = <div><strong>YOU WIN!!!</strong></div>;
        } else {
          yourTurn = <div><strong>YOU LOSE!!!</strong></div>;
        }
      } else {
        winner = <div>{this.props.ctx.gameover}</div>
      }      
    }

    let hand = [];
    if (this.props.G.players[this.props.playerID]) {
      hand = this.props.G.players[this.props.playerID].hand;
    }

    return (
      <div>
        {winner}
        <ul>{this.props.matchData.map((player, index) => <li key={index} style={{color: parseInt(this.props.ctx.currentPlayer) === index ? 'red' : 'black'}}>{player.name}{player.isConnected ? '' : 'not connected'}</li>)}</ul>
        <h1 style={{color: this.props.G.currentCard.color === 'wild' ? 'purple' : this.props.G.currentCard.color}}>{this.props.G.currentCard.number}</h1>
        {yourTurn}
        <button onClick={() => this.drawCard()}>DRAW CARD <br/>{this.props.G.deck.length} cards remaining</button>
        <hr/>
        <div>
            {hand.map((card, index) => <button key={index} onClick={() => this.playCard(index)} style={{background: card.color === 'wild' ? 'purple' : card.color}}>{card.number}</button>)}
        </div> 
      </div>
    );
  }
}