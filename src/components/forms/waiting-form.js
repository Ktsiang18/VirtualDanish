import React from 'react'

export class WaitingForm extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
        <div>Code for current game:
          <ul>
            <li>Current players: </li>
          </ul>
          <button>Start game!</button>
        </div>
    );
  }
}

export default WaitingForm;
