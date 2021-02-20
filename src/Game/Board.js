import React from 'react';
import { Popover } from 'react-tiny-popover';
import ReactInterval from 'react-interval';

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
      yourTurn = <span>{this.props.G.reverse ? '< ' : ''}<i className="nes-icon heart is-small"></i>Your Turn<i className="nes-icon heart is-small"></i>{this.props.G.reverse ? '' : ' >'}</span>;
    } else if(this.props.matchData[this.props.ctx.currentPlayer].hasOwnProperty('name')) {
      yourTurn = <span>{this.props.G.reverse ? '< ' : ''}{this.props.matchData[this.props.ctx.currentPlayer].name}'s Turn{this.props.G.reverse ? '' : ' >'}</span>
    }

    let winner = '';
    if (this.props.G.currentWinner !== null) {
      const youWin = parseInt(this.props.G.currentWinner, 10)  === parseInt(this.props.playerID, 10);
      winner = <h2 className="text-center"><i className="nes-icon trophy is-med"></i>{youWin ? 'YOU WIN!!!' : `${this.props.matchData[this.props.G.currentWinner].name} WINS!!!`}<i className="nes-icon trophy is-med"></i></h2>;
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
        <div className="container">
          {winner}
          <div className="nes-container with-title">
            <p className={`title ${isYourTurn ? 'nes-text is-error' : ''}`}>{yourTurn}</p>
            {this.props.matchData.map((player, index) => player.hasOwnProperty('name') && this.props.G.players[index] ? <button key={index} onClick={() => this.punish(index)} className={this.props.G.players[index].calledUna ? 'called-una nes-badge is-splited' : 'nes-badge is-splited'}><span className={player.isConnected ? (parseInt(this.props.ctx.currentPlayer, 10) === index ? 'is-error' : 'is-primary'): 'is-dark'}>{player.name}{this.props.G.players[index].wins ? `(${this.props.G.players[index].wins})` : ''}</span><span className="is-dark">{this.props.G.players[index].hand.length}</span></button> : '')}
          </div>
          <div className="text-center">
            <button className="nes-btn card deck mb mt" onClick={() => this.drawCard()}><span>DRAW<br/>CARD</span></button>
            <div className={`discard card nes-btn mb mt ${getCardClass(this.props.G.currentCard.color)}`}><span>{this.props.G.currentCard.number}</span></div>
          </div>
          <hr/>
          <div className="hand-wrap">
              {hand.map((card, index) => card.color === 'wild' ?
              <Popover
                key={index}
                isOpen={this.state.isPopoverOpenIndex === card.originalIndex}
                onClickOutside={() => this.setIsPopoverOpen(null)}
                content={
                  <div className="nes-balloon from-left wild-balloon">
                    <p>
                      <button className="nes-btn is-primary" aria-label="play blue wild" onClick={() => this.playCard(card.originalIndex, card, 'blue')}></button>
                      <button className="nes-btn is-success" aria-label="play green wild" onClick={() => this.playCard(card.originalIndex, card, 'green')}></button>
                      <button className="nes-btn is-error" aria-label="play red wild" onClick={() => this.playCard(card.originalIndex, card, 'red')}></button>
                      <button className="nes-btn is-warning" aria-label="play yellow wild" onClick={() => this.playCard(card.originalIndex, card, 'yellow')}></button>
                    </p>
                  </div>
                }
              >
                <button onClick={() => this.setIsPopoverOpen(this.state.isPopoverOpenIndex === card.originalIndex ? null : card.originalIndex)} className="card nes-btn mb wild"><span>{card.number}</span></button>
              </Popover>
              : <button key={index} className={`card nes-btn mb ${getCardClass(card.color)}`} onClick={() => this.playCard(card.originalIndex, card)}><span>{card.number}</span></button>)}
          </div> 
        </div>
        {this.props.G.players[this.props.playerID] ? <button id="call-una" className="nes-btn is-success" onClick={() => this.callUna()}>U</button> : ''}
        <div id="time">{ isYourTurn ? this.state.timeRemaining : ''}</div>
        <ReactInterval timeout={1000} enabled={true} callback={() => this.checkTime(isYourTurn)} />
      </main>
    );
  }
}