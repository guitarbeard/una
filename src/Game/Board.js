import React from 'react';
import { Popover } from 'react-tiny-popover';
import ReactInterval from 'react-interval';

function sortByNumber(a, b) {
  const compare = a.numberIndex - b.numberIndex;
  return compare;
}

function sortByColor(a, b) {
  const compare = a.colorIndex - b.colorIndex;
  return compare;
}

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopoverOpenIndex: null,
      timeRemaining: 7
    };
  }

  drawCard() {
    if (this.props.G.players[this.props.playerID]) {
      if (this.props.ctx.currentPlayer === this.props.playerID) {
        this.props.moves.drawCard(this.props.playerID);
        this.setState({isPopoverOpenIndex: null, timeRemaining: 7});
      }
    }
  }

  playCard(index, card, color = false) {
    if (this.props.G.players[this.props.playerID]) {
      if (this.props.ctx.currentPlayer === this.props.playerID || (card.color === this.props.G.currentCard.color && card.type === this.props.G.currentCard.type && card.number === this.props.G.currentCard.number)) {
        this.props.moves.playCard(this.props.playerID, index, color);
        this.setState({isPopoverOpenIndex: null});
        if ((this.props.ctx.currentPlayer === this.props.playerID) && (card.color === this.props.G.currentCard.color || card.number === this.props.G.currentCard.number || card.color === 'wild')) {
          this.setState({timeRemaining: 7});
        }
      }
    }
  }

  playerJoin() {
    this.props.moves.playerJoin(this.props.playerID);
  }

  callUna() {
    if (this.props.G.players[this.props.playerID]) {
      this.props.moves.callUna(this.props.playerID);
    }
  }

  punish(playerID) {
    if (this.props.G.players[this.props.playerID]) {
      if (!this.props.G.players[playerID].calledUna && this.props.G.players[playerID].hand.length === 1) {
        this.props.moves.punish(playerID);
      }
    }
  }

  setIsPopoverOpen(isPopoverOpenIndex) {
    if (this.props.G.players[this.props.playerID]) {
      this.setState({isPopoverOpenIndex});
    }
  }

  checkTime(isYourTurn) {
    if (isYourTurn) {
      this.setState({timeRemaining: this.state.timeRemaining - 1});
      if (this.state.timeRemaining === 0) {
        this.drawCard();
      }  
    } else {
      this.setState({timeRemaining: 7});
    }
     // pass unconnected player but requires original player to be connected
     if (this.props.playerID === '0' && !this.props.matchData[this.props.ctx.currentPlayer].isConnected) {
      this.props.moves.pass();
    }
  }

  componentDidMount() {
    if (this.props.playerID && this.props.matchData[this.props.playerID].hasOwnProperty('name') && !this.props.G.players[this.props.playerID]) {
      this.playerJoin();
    }
  }

  render() {
    const isYourTurn = parseInt(this.props.ctx.currentPlayer, 10) === parseInt(this.props.playerID, 10);

    let yourTurn = '';
    if (isYourTurn) {
      yourTurn = <div id="turn"><marquee>⭐ Your Turn ⭐</marquee></div>;
      if (this.props.G.currentWinner !== null && parseInt(this.props.G.currentWinner, 10)  === parseInt(this.props.playerID, 10)) {
        yourTurn = <div id="turn"><marquee>⭐ YOU WIN!!! ⭐</marquee></div>;
      }
    } else {
      if (this.props.G.currentWinner !== null && parseInt(this.props.G.currentWinner, 10)  === parseInt(this.props.playerID, 10)) {
        yourTurn = <div id="turn"><marquee>⭐ YOU WIN!!! ⭐</marquee></div>;
      }
    }    

    let hand = [];
    if (this.props.G.players[this.props.playerID]) {
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
    }

    return (
      <main className={isYourTurn ? 'your-turn' : ''}>
        {yourTurn}
        <div id="players" className="center"><ul>
          {this.props.matchData.map((player, index) => (player.hasOwnProperty('name') && this.props.G.players[index] ? 
            <li key={index} className={`player-btn-wrap ${this.props.G.players[index].calledUna ? 'said-una' : ''} ${!player.isConnected ? 'away' : ''} ${parseInt(this.props.G.currentWinner, 10) === index ? 'winner' : ''}`}>
              <button onClick={() => this.punish(index)} className={`player-btn chip ${parseInt(this.props.ctx.currentPlayer, 10) === index ? 'cyan white-text z-depth-2' : ''}`}>
                <span>{player.name}</span>
                {parseInt(this.props.ctx.currentPlayer, 10) === index ? this.props.G.reverse ? <i className="material-icons reverse">arrow_back</i> : <i className="material-icons forward">arrow_forward</i> : ''}
                {this.props.G.players[index].hand.length ? <div className="red lighten-1 white-text card-count">{this.props.G.players[index].hand.length}</div> : ''}
              </button>
              {this.props.G.players[index].wins > 0 ? <span className="win-count">{this.props.G.players[index].wins} ⭐</span> : ''}
            </li>
          : ''))}
        </ul></div>
        <canvas id="confetti"></canvas>
        <div id="piles">
            <button id="draw" onClick={() => this.drawCard()} className="card"><span>DRAW<br/>CARD</span></button>
            <div id="discardpile" data-number={this.props.G.currentCard.number} data-color={this.props.G.currentCard.color} className="card"><span>{this.props.G.currentCard.number}</span></div>
        </div>

        <div id="overflowbox">
            <div id="mycards">
              {hand.map((card, index) => card.color === 'wild' ?
                <Popover
                  key={index}
                  isOpen={this.state.isPopoverOpenIndex === card.originalIndex}
                  onClickOutside={() => this.setIsPopoverOpen(null)}
                  content={
                    <div id="color-picker">
                      <button className="btn blue" aria-label="play blue wild" onClick={() => this.playCard(card.originalIndex, card, 'blue')}></button>
                      <button className="btn green" aria-label="play green wild" onClick={() => this.playCard(card.originalIndex, card, 'green')}></button>
                      <button className="btn red" aria-label="play red wild" onClick={() => this.playCard(card.originalIndex, card, 'red')}></button>
                      <button className="btn yellow" aria-label="play yellow wild" onClick={() => this.playCard(card.originalIndex, card, 'yellow')}></button>
                    </div>
                  }
                >
                  <button data-number={card.number} data-color={card.color} onClick={() => this.setIsPopoverOpen(this.state.isPopoverOpenIndex === card.originalIndex ? null : card.originalIndex)} className="card"><span>{card.number}</span></button>
                </Popover>
                : <button key={index} data-number={card.number} data-color={card.color} className="card" onClick={() => this.playCard(card.originalIndex, card)}><span>{card.number}</span></button>)
              }
            </div>
        </div>

        <div className="fixed-action-btn">
          {this.props.G.players[this.props.playerID] ? <button id="call-una" className="btn-floating btn-large cyan" title="call una!" onClick={() => this.callUna()}><span>U</span></button> : ''}
        </div>

        <div id="time">{ isYourTurn ? this.state.timeRemaining : ''}</div>
        <ReactInterval timeout={1000} enabled={true} callback={() => this.checkTime(isYourTurn)} />
      </main>
    );
  }
}