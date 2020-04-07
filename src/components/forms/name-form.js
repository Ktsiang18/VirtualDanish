import React from 'react'

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
    this.props.changeForm()
    alert('Hello ' + this.state.name +'!')
  }

  render(){
    return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Please enter your name:
            <input type="text" value={this.state.name} onChange={this.handleChange} />
            <input type="submit" value="Submit"/>
          </label>
        </form>

    );
  }
}

export default NameForm;
