import React from 'react'
import NameForm from './forms/name-form'
import JoinCreateForm from './forms/join-create-game-form'
import WaitingForm from './forms/waiting-form'
import './css/start.css'


export class Start extends React.Component {
  constructor(props){
    super(props)

    this.state = {currentForm: 0};
    this.changeForm = this.changeForm.bind(this);

    this.forms = [
      <NameForm changeForm={this.changeForm}/>,
      <JoinCreateForm changeForm={this.changeForm}/>,
      <WaitingForm changeForm={this.changeForm}/>
    ]

  }

  changeForm(){
     this.setState({
       currentForm: this.state.currentForm + 1
     });
  }

  render(){
    return (
      <div>
        <h1 className="title">Welcome to Danish!</h1>
        {this.forms[this.state.currentForm]}
      </div>
    );
  }
}

export default Start;
