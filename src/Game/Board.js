import React from 'react';
import { Popover } from 'react-tiny-popover';
import ReactInterval from 'react-interval';

function sortByNumber(a, b) {
  const compare = a.numberIndex - b.numberIndex;
  return compare;
}

function sortByID(a, b) {
  const compare = parseInt(a.id, 10) - parseInt(b.id, 10);
  return compare;
}

function sortByColor(a, b) {
  const compare = a.colorIndex - b.colorIndex;
  return compare;
}

function getPlayer(G, playerID) {
  return G.players.find(player => parseInt(player.id, 10) === parseInt(playerID, 10));
}

function playConfetti(seconds = 7, particles = 150) {
  var duration = seconds * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = particles * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
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
    if (getPlayer(this.props.G, this.props.playerID)) {
      if (this.props.ctx.currentPlayer === this.props.playerID) {
        this.props.moves.drawCard(this.props.playerID);
        this.setState({isPopoverOpenIndex: null, timeRemaining: 7});
      }
    }
  }

  playCard(index, card, color = false) {
    if (getPlayer(this.props.G, this.props.playerID)) {
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
    if (getPlayer(this.props.G, this.props.playerID)) {
      this.props.moves.callUna(this.props.playerID);
    }
  }

  punish(playerID) {
    if (getPlayer(this.props.G, this.props.playerID)) {
      if (!this.props.G.players[playerID].calledUna && this.props.G.players[playerID].hand.length === 1) {
        this.props.moves.punish(playerID);
      }
    }
  }

  setIsPopoverOpen(isPopoverOpenIndex) {
    if (getPlayer(this.props.G, this.props.playerID)) {
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
    this.playerJoin();
  }

  componentDidUpdate(prevProps) {
    if (getPlayer(this.props.G, this.props.playerID)) {
      if (!getPlayer(this.props.G, this.props.playerID).hand.length) {
        if (getPlayer(this.props.G, this.props.playerID).hand.length !== getPlayer(prevProps.G, prevProps.playerID).hand.length) {
          if (this.props.ctx.gameover && this.props.ctx.gameover.winner !== undefined) {
            if (this.props.ctx.gameover.winner.id === this.props.playerID) {
              playConfetti(14);
            }
          } else {
            playConfetti();
          }
        }
      }
    }
  }

  render() {
    const isYourTurn = parseInt(this.props.ctx.currentPlayer, 10) === parseInt(this.props.playerID, 10);
    let win = '';
    let youWonGame = false;
    if (this.props.ctx.gameover && this.props.ctx.gameover.winner !== undefined) {
      youWonGame = this.props.ctx.gameover.winner.id === this.props.playerID;
      win = <div id="win"><marquee>⭐ {youWonGame ? 'YOU WIN!!! ⭐' : `${this.props.matchData[parseInt(this.props.ctx.gameover.winner.id, 10)].name} WINS!!! 💀 YOU LOSE 💀`}</marquee></div>;
    }

    let hand = [];
    if (getPlayer(this.props.G, this.props.playerID)) {
      hand = getPlayer(this.props.G, this.props.playerID).hand.map((card, index) => {
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
        {win}
        <div id="players" className="center"><ul>
          {this.props.G.players.sort(sortByID).map((player, index) =>
            <li key={index} className={`player-btn-wrap ${player.calledUna ? 'said-una' : ''} ${!this.props.matchData[parseInt(player.id, 10)].isConnected ? 'away' : ''}`}>
              <button onClick={() => this.punish(parseInt(player.id, 10))} className={`player-btn chip ${parseInt(this.props.ctx.currentPlayer, 10) === parseInt(player.id, 10) ? 'cyan white-text z-depth-2' : ''}`}>
                <span>{this.props.matchData[parseInt(player.id, 10)].name}</span>
                {parseInt(this.props.ctx.currentPlayer, 10) === parseInt(player.id, 10) ? this.props.G.reverse ? <i className="material-icons reverse">arrow_back</i> : <i className="material-icons forward">arrow_forward</i> : ''}
                {player.hand.length ? <div className="red lighten-1 white-text card-count">{player.hand.length}</div> : ''}
              </button>
              {player.wins > 0 ? <span className="win-count">{player.wins} ⭐</span> : ''}
            </li>
          )}
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
          {getPlayer(this.props.G, this.props.playerID) ? <button id="call-una" className="btn-floating btn-large cyan" title="call una!" onClick={() => this.callUna()}><span>U</span></button> : ''}
        </div>

        <div id="time">{ isYourTurn && !this.props.ctx.gameover ? this.state.timeRemaining : ''}</div>
        <ReactInterval timeout={1000} enabled={!this.props.ctx.gameover} callback={() => this.checkTime(isYourTurn)} />
      </main>
    );
  }
}