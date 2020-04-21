import React from 'react'
import NameForm from './forms/name-form'
import JoinCreateForm from './forms/join-create-game-form'
import WaitingForm from './forms/waiting-form'
import './css/start.css'
import {Route, Link, BrowserRouter as Router} from 'react-router-dom'


export class Start extends React.Component {
  render(){
    return (
      <div>
        <h1 className="title">Welcome to Danish!</h1>
        <Router>
          <div>
            <Route path = '/start/name'>
              <NameForm />
            </Route>
            <Route path = '/start/:id/joinCreate'>
              <JoinCreateForm/>
            </Route>
            <Route path = '/start/:id/waiting'>
              <WaitingForm/>
            </Route>
          </div>
        </Router>
      </div>
    );
  }
}

export default Start;
