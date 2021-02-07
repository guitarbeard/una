import React from 'react';


export class JoinOrCreate extends React.Component {
    constructor(props) {
      super(props);
      this.state = {code: '', name: ''};
  
      this.handleCodeChange = this.handleCodeChange.bind(this);
      this.handleNameChange = this.handleNameChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleCodeChange(event) {
      this.setState({code: event.target.value});
    }

    handleNameChange(event) {
        this.setState({name: event.target.value});
    }
  
    handleSubmit(event) {
      event.preventDefault();
      this.props.setPlayerID(this.state.name);
      this.props.setMatchID(this.state.code);
    }
  
    render() {
      return (
          <div>
            <h1>Join</h1>
            <form onSubmit={this.handleSubmit}>
                
                <label>
                Game Code:
                <input type="text" value={this.state.code} onChange={this.handleCodeChange} />
                </label>
                <label>
                Name:
                <input type="text" value={this.state.name} onChange={this.handleNameChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
          </div>
        
      );
    }
  }