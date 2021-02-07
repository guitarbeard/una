import React from 'react';

export class UnaBoard extends React.Component {
  drawCard() {
    this.props.moves.drawCard(this.props.playerID);
  }

  playCard(index) {
    this.props.moves.playCard(this.props.playerID, index);
  }

  render() {
    let winner = '';
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    let hand = [];
    if (this.props.G.players['player_' + this.props.playerID]) {
      hand = this.props.G.players['player_' + this.props.playerID].hand;
    }

    return (
      <div>
        {winner}
        <h1 style={{color: this.props.G.currentCard.color === 'wild' ? 'purple' : this.props.G.currentCard.color}}>{this.props.G.currentCard.number}</h1>
        <button onClick={() => this.drawCard()}>DRAW CARD <br/>{this.props.G.deck.length} cards remaining</button>
        <hr/>
        <div>
            {hand.map((card, index) => <button key={index} onClick={() => this.playCard(index)} style={{background: card.color === 'wild' ? 'purple' : card.color}}>{card.number}</button>)}
        </div> 
      </div>
    );
  }
}