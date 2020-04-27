import React from 'react';
import {Route, Link, Switch, BrowserRouter as Router } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import Pusher from 'pusher-js'
import Constants from './constants'

import NameForm from './components/forms/name-form'
import JoinCreateForm from './components/forms/join-create-game-form'
import WaitingForm from './components/forms/waiting-form'
import Swap from './components/swap'
import TakeTurns from './components/taketurns'
import GameWon from './components/game-won'

function App() {

  const getCards = async (user_id) => {
    const res = await fetch('/getUsersCards/' + user_id +'/', { method: 'GET'})
    const json = await res.json()
    return json
  }

  const setCards = async (user_id, newCards) => {
    fetch('/setUsersCards', {
      method: 'POST',
      body: JSON.stringify({ cards: newCards,
              user_id: user_id })
    })
    .then(res => res.json())
    .then(data => console.log(data.message))
  }

  const pusher = new Pusher(Constants.PUSHER_APP_ID, Constants.PUSHER_OPTIONS);
  const channel = pusher.subscribe(Constants.PUSHER_CHANNEL);

  return (
    <div className="App">
      <header className="App-header">
      <Router>
        <div>
        <Switch>
          <Route path = '/start/:id/joinCreate'>
            <JoinCreateForm/>
          </Route>
          <Route path = '/start/:id/waiting'>
            <WaitingForm pusherChannel={channel}/>
          </Route>
          <Route path = '/play/:id/:game_id/swap/' render={(props) =>
            <Swap getCards={getCards} setCards={setCards}/>}
          />
          <Route path = '/play/:id/:game_id/turn/' render={(props) =>
             <TakeTurns getCards={getCards} pusherChannel={channel}/>}
          />
          <Route path = '/finish/:id/:winner_id'>
            <GameWon/>
          </Route>
          <Route path = '/'>
            <NameForm />
          </Route>
          </Switch>
        </div>
      </Router>
      </header>
    </div>
  );
}

export default App;
