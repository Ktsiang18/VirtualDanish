import React from 'react'

export class JoinCreateForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {code: ''};

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({name: event.target.value})
  }

  handleSubmit(event) {
    alert('Joining game ' + this.state.code +'!')
    this.props.changeForm()
  }

  render(){
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Enter your code to join an existing game:
            <input type="text" value={this.state.code} onChange={this.handleChange} />
            <input type="submit" value="Join Game"/>
          </label>
        </form>
        <label>Or start a new game
        <button onClick={this.props.changeForm}>Create New Game</button></label>
      </div>
    );
  }
}

export default JoinCreateForm;
