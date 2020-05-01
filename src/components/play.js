import React from 'react'
import Constants from '../constants.js'
import Swap from './swap'
import TakeTurns from './taketurns'
import {Route, Link, BrowserRouter as Router} from 'react-router-dom'

export class Play extends React.Component {
  constructor(props){
    super(props)
    this.getCards = this.getCards.bind(this)
    this.setCards = this.setCards.bind(this)
  }

  async getCards(user_id){
    const res = await fetch(Constants.PROXY +'/getUsersCards/' + user_id +'/', { method: 'GET'})
    const json = await res.json()
    return json
  }

  async setCards(user_id, newCards){
    fetch(Constants.PROXY +'/setUsersCards', {
      method: 'POST',
      body: JSON.stringify({ cards: newCards,
              user_id: user_id })
    })
    .then(res => res.json())
    .then(data => console.log(data.message))
  }

  render(){
    return (
      <Router>
        <div>
          <Route path = '/play/:id/:game_id/swap/' render={(props) =>
            <Swap getCards={this.getCards} setCards={this.setCards}/>}
          />
          <Route path = '/play/:id/:game_id/turn/' render={(props) =>
             <TakeTurns getCards={this.getCards}/>}
          />
        </div>
      </Router>
    )
  }
}

export default Play
