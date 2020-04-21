import React from 'react'
import {withRouter} from 'react-router-dom'

export class NameForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {name: ''};

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({name: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault();

    fetch('/nameForm', {
      method: 'POST',
      body: JSON.stringify({ name: this.state.name }),
    })
    .then(res => res.json())
    .then(data =>{
      alert('Hello ' + this.state.name +'!')
      console.log(data)
      this.props.history.push('/start/' + data.user.id + '/joinCreate')
    })

  }

  render(){
    return (
        <form onSubmit={this.handleSubmit} method="post">
          <label>
            Please enter your name:
            <input type="text" value={this.state.name} onChange={this.handleChange} />
              <input type="submit" value="Submit"/>
          </label>
        </form>

    );
  }
}

export default withRouter(NameForm);
