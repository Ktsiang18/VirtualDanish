import React, {useEffect, useState} from 'react'
import Hand from './hand'
import {Route, Link, BrowserRouter as Router, useParams} from 'react-router-dom'
import Pusher from 'pusher-js'
import Constants from '../constants'
function TakeTurns(props) {
  let {id, game_id} = useParams()
  const [pileTop, setPileTop] = useState(-1)
  const [currentPlayerId, setCurrentPlayerId] = useState(0)
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [uphand , setUphand] = useState([])
  const [downhand , setDownhand] = useState([])
  const [hand , setHand] = useState([])
  const [chosenCards, setChosen] = useState([])

  const fetchPileTop = () => {
    fetch('/getPileTop/'+id+'/', { method: 'GET' })
    .then(res => res.json())
    .then(data => {
      setPileTop(data.name)
    })
  }

  const fetchCurrentPlayersTurn = () => {
    fetch('/getCurrentPlayer/' + id + '/', {method: 'GET'})
    .then(res => res.json())
    .then(data => {
      setCurrentPlayerId(data.player_id)
      setCurrentPlayerName(data.player_username)
    })
  }

  const fetchPlayersCards = () => {
    props.getCards(id)
    .then(result => {
      setUphand(result.uphand)
      setDownhand(result.downhand)
      setHand(result.hand)
    })
  }

  useEffect(() => {
    fetchPileTop()
    fetchCurrentPlayersTurn()
  }, [currentPlayerId])

  useEffect(() =>{
    fetchPlayersCards()
  }, [currentPlayerId])


  const onSelect = (card_id) => {
    const alreadyChosen = chosenCards.findIndex(cid => cid === card_id)

    if(alreadyChosen !== -1){
      const filtered = chosenCards.filter((c)=>c !== card_id)
      setChosen(filtered)

    } else {
      setChosen([...chosenCards, card_id])
    }
  }

  const finishPlayersTurn = () => {
      setChosen([])
      fetch('/updateCurrentPlayer', {
        method: 'POST',
        body: JSON.stringify({
          user_id: id,
        })
      })
      .then(res => res.json())
      .then(data => console.log(data))
  }
  const onPickUpPile = () => {
    fetch('/pickUpPile', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
      })
    }).then(() => {
      finishPlayersTurn()
    })
  }

  const validateCards = async() => {
    if(chosenCards.length < 1){ alert('you must choose at least one card') }

    const data = await fetch('/validatePlayableCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: chosenCards,
      })
    })
    return data
  }

  const putDownCards = async() => {
    const data = await fetch('/playCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: chosenCards,
      })
    })
    return data
  }

  const refillHand = async() => {
    const data = await fetch('/refillHand', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id
      })
    })
    return data
  }

  const submitCards = () => {
    validateCards()
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        alert(data.message, 'please try again')
        setChosen([])
      } else {
        putDownCards()
        .then(() => refillHand())
        .then(() => finishPlayersTurn())
      }
    })
  }

  const pusher = new Pusher(Constants.PUSHER_APP_ID, Constants.PUSHER_OPTIONS);
  const channel = pusher.subscribe(Constants.PUSHER_CHANNEL);
  console.log(game_id)
  channel.bind('change-turn-' + game_id, function(data) {
    console.log('change turn triggered', data.current_player_id)
    setCurrentPlayerId(data.current_player_id)
  })


  const playing = <span>
                    <button onClick={onPickUpPile}>Pick up pile</button>
                    <button onClick={submitCards}>Play cards</button>
                  </span>
  const waiting = <span>Waiting for {currentPlayerName} to play</span>
  return (
    <div>Time to play!
      <div>Top of the pile: {pileTop || '---'}</div>
      <div> {currentPlayerId == id ? 'Your Turn!' : currentPlayerName + '\'s Turn'}</div>

      <Hand label='Downcards' cards={downhand}/>
      <Hand label='Upcards' cards={uphand} selected={[]} onSelect={(cid)=> alert('Cannot play uphand card')}/>
      <Hand label='Hand' cards={hand} selected={chosenCards} onSelect={onSelect}/>

      {currentPlayerId == id ? playing : waiting}
    </div>
  )
}

export default TakeTurns
