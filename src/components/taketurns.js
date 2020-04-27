import React, {useEffect, useState} from 'react'
import Hand from './hand'
import {Route, Link, BrowserRouter as Router, useParams} from 'react-router-dom'

function TakeTurns(props) {
  let {id, game_id} = useParams()
  const [pileTop, setPileTop] = useState(-1)
  const [currentPlayerId, setCurrentPlayerId] = useState(0)
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [uphand , setUphand] = useState([])
  const [downhand , setDownhand] = useState([])
  const [hand , setHand] = useState([])
  const [usingDownCards, setUsingDownCards] = useState(false)
  const [chosenCards, setChosen] = useState([])
  const [chosenDownCard, setChosenDowncard] = useState(0)

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
  const gameWonState = () => {
    props.history.push('/finish/' + id + '/' + id)
  }

  const fetchPlayersCards = () => {
    props.getCards(id)
    .then(result => {
      let cards = result.cards
      if (result.gameWon){
        gameWonState()
        return
      }
      setUphand(cards.uphand)
      setDownhand(cards.downhand)
      setHand(cards.hand.sort((c_a, c_b) => c_a.value - c_b.value))
      setUsingDownCards(result.usingDownCards)
    })
  }

  useEffect(() => {
    fetchPileTop()
    fetchCurrentPlayersTurn()
  }, [pileTop, currentPlayerId])

  useEffect(() =>{
    fetchPlayersCards()
  }, [pileTop, currentPlayerId])


  const onSelect = (card_id) => {
    const alreadyChosen = chosenCards.findIndex(cid => cid === card_id) !== -1
    if(alreadyChosen){
      setChosen(chosenCards.filter((c)=>c !== card_id))
    } else {
      setChosen([...chosenCards, card_id])
    }
  }

  const onSelectDowncard = (card_id) => {
    if(usingDownCards && (hand.length == 0)){
      setChosenDowncard(card_id)
    } else {
      alert('Cannot use downcards yet')
    }
  }
  const finishPlayersTurn = () => {
      fetch('/updateCurrentPlayer', {
        method: 'POST',
        body: JSON.stringify({
          user_id: id,
        })
      })
      .then(res => res.json())
      .then((data) => {
        setCurrentPlayerId(data.current_player_id)
        setPileTop(data.top_card)
        setChosen([])
        setChosenDowncard(null)
      })
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

  const validateCards = async(cards) => {
    if(cards.length < 1){ alert('you must choose at least one card') }

    const data = await fetch('/validatePlayableCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: cards,
      })
    })
    return data
  }

  const putDownCards = async(cards) => {
    const data = await fetch('/playCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: cards,
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
    let cards = []
    if(chosenDownCard){
      cards = [chosenDownCard]
      let card = downhand.filter(c => c.id == chosenDownCard)[0]
      console.log(card)
      alert('You flipped a ' +  card.name)
    } else {
      cards = chosenCards
    }

    validateCards(cards)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        if(chosenDownCard){
          putDownCards([chosenDownCard])
          .then(() => onPickUpPile())
          .then(() => finishPlayersTurn())
        } else {
          alert(data.message, 'please try again')
          setChosen([])
        }
      } else {
        putDownCards(cards)
        .then(() => refillHand())
        .then(() => finishPlayersTurn())
      }
    })
  }

  props.pusherChannel.bind('change-turn-' + game_id, function(data) {
    if(data.last_player !== id){
      setCurrentPlayerId(data.current_player_id)
      setPileTop(data.top_card)
      setChosen([])
    }
  })

  props.pusherChannel.bind('game-won-' + game_id, function(data) {
    props.history.push('/finish/' + id + '/' + data.winner_id)
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

      <Hand label='Downcards' cards={downhand} selected={[chosenDownCard]} onSelect={onSelectDowncard}/>
      <Hand label='Upcards' cards={uphand} selected={[]} onSelect={(cid)=> alert('Cannot play uphand card')}/>
      <Hand label='Hand' cards={hand} selected={chosenCards} onSelect={onSelect}/>

      {currentPlayerId == id ? playing : waiting}
    </div>
  )
}

export default TakeTurns
