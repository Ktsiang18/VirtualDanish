import React, {useEffect, useState} from 'react'
import Constants from '../constants.js'
import Hand from './hand'
import {Route, Link, withRouter, useParams} from 'react-router-dom'
import {Button, Col, Row, Card, CardDeck, Spinner, Alert, Modal} from 'react-bootstrap'
import PlayingCard from './card'
import GameWon from './game-won'
import './css/play.css'

function TakeTurns(props) {
  let {id, game_id} = useParams()
  const [pileTop, setPileTop] = useState({id:null})
  const [currentPlayerId, setCurrentPlayerId] = useState(0)
  const [currentPlayerName, setCurrentPlayerName] = useState('')

  const [uphand , setUphand] = useState([])
  const [downhand , setDownhand] = useState([])
  const [hand , setHand] = useState([])

  const [usingDownCards, setUsingDownCards] = useState(false)
  const [chosenCards, setChosen] = useState([])
  const [chosenDownCard, setChosenDowncard] = useState(0)
  const [deckSize, setDeckSize] = useState(0)

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showFlippedModal, setShowFlippedModal] = useState(false)
  const [flippedCard, setFlippedCard] = useState(null)

  const [winnerId, setWinnerId] = useState(null)

  const errorAlert = (message) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  const fetchPileTop = () => {
    fetch(Constants.PROXY +'/getPileTop/'+id+'/', { method: 'GET' })
    .then(res => res.json())
    .then(card => {
      if( card.name){
        setPileTop(card)
        if(card.value==10){

          fetch(Constants.PROXY +'/clearPile', {
            method: 'POST',
            body: JSON.stringify({
              user_id: id
            })
          })
          setPileTop({id:null})
        }
      } else {
        setPileTop({id:null})
      }
    })
  }

  const fetchDeckSize = () => {
    fetch(Constants.PROXY +'/getDeckSize/' + id, { method: 'GET' })
    .then(res => res.json())
    .then(data => {
      setDeckSize(data.deck_size)
    })
  }

  const fetchCurrentPlayersTurn = () => {
    fetch(Constants.PROXY +'/getCurrentPlayer/' + id + '/', {method: 'GET'})
    .then(res => res.json())
    .then(data => {
      setCurrentPlayerId(data.player_id)
      setCurrentPlayerName(data.player_username)
    })
  }
  const gameWonState = () => {
    setWinnerId(id)
  }

  const fetchPlayersCards = () => {
    props.getCards(id)
    .then(result => {
      let cards = result.cards
      if (result.gameWon){
        gameWonState()
      }
      setUphand(cards.uphand)
      setDownhand(cards.downhand)
      setHand(cards.hand.sort((c_a, c_b) => c_a.value - c_b.value))
      setUsingDownCards(result.usingDownCards)
    })
  }

  useEffect(() => {
    fetchPileTop()
    fetchDeckSize()
    fetchCurrentPlayersTurn()
  }, [pileTop.id, currentPlayerId])

  useEffect(() =>{
    fetchPlayersCards()
  }, [pileTop.id, currentPlayerId])


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
      errorAlert('You can\'t use your downcards yet.')
    }
  }
  const finishPlayersTurn = () => {
      fetch(Constants.PROXY +'/updateCurrentPlayer', {
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
        setChosenDowncard(0)
      })
  }
  const onPickUpPile = () => {
    fetch(Constants.PROXY +'/pickUpPile', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
      })
    }).then(() => {
      finishPlayersTurn()
    })
  }

  const validateCards = async(cards) => {
    if(cards.length < 1){ errorAlert('You haven\'t chosen any cards to play.') }

    const data = await fetch(Constants.PROXY +'/validatePlayableCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: cards,
      })
    })
    return data
  }

  const putDownCards = async(cards) => {
    const data = await fetch(Constants.PROXY +'/playCards', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id,
        card_ids: cards,
      })
    })
    return data
  }

  const refillHand = async() => {
    const data = await fetch(Constants.PROXY +'/refillHand', {
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
      setFlippedCard(card)
      setShowFlippedModal(true)
    } else {
      cards = chosenCards
    }

    validateCards(cards)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        if(chosenDownCard){
          putDownCards([chosenDownCard])
          .then(() => fetch(Constants.PROXY +'/pickUpPile', {
                        method: 'POST',
                        body: JSON.stringify({
                          user_id: id,
                        })
                      })
                      .then(() => finishPlayersTurn())
          )
        } else {
          errorAlert(data.message, 'please try again')
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
    setCurrentPlayerId(data.current_player_id)
    setPileTop(data.top_card)
  })

  props.pusherChannel.bind('game-won-' + game_id, function(data) {
    setWinnerId(data.winner_id)
  })

  const playCardButton = (chosenCards.length > 0 || chosenDownCard !== 0 )?
                              (<Button variant="primary" onClick={submitCards} >
                                  Play Chosen Card{chosenCards.length > 1 ? 's':''}
                              </Button>)
                              :(<Button variant="primary" disabled>No Cards Chosen</Button> )

  const pickUpPileButton = <Button className="pickup-button" variant="outline-warning" onClick={onPickUpPile}>Pick Up Pile</Button>

  const playing = <div> {playCardButton} {pickUpPileButton} </div>
  const waiting = <span className="grey"> <Spinner variant="secondary" animation="grow" size="sm"/> Waiting for {currentPlayerName} to play</span>

  const blankCard = (label, value) => <Card bg="dark"  text="secondary">
                      <Card.Header> &#8709; </Card.Header>
                      <Card.Body>
                        <Card.Title className="card-value"><h2>-</h2> </Card.Title>
                      </Card.Body>
                      <footer className="footer">{label} is empty </footer>
                    </Card>

  const topCardItem = pileTop.id ? <PlayingCard
                                      card={pileTop}
                                      onSelect={()=>null}
                                      isSelected={false}
                                      isDowncard={false}
                                    /> : blankCard('Pile', '-')

  const deckCounterItem = deckSize > 0 ? <Card bg="info"  text="light">
                                        <Card.Header> &#8709; </Card.Header>
                                        <Card.Body>
                                          <Card.Title className="card-value"><h2 className="deck-counter">{deckSize}</h2></Card.Title>
                                        </Card.Body>
                                        <footer className="footer">Deck has {deckSize} card{deckSize > 1 ? 's' : ''} </footer>
                                      </Card>
                                      : blankCard('Deck', 0)

  const errorAlertItem = <Row><Alert variant="danger" show={showErrorAlert} onClose={()=>setShowErrorAlert(false)} dismissible>
                                <Alert.Heading>Oops!</Alert.Heading>
                                <p className="smaller-p">{errorMessage}</p>
                          </Alert>
                        </Row>

  const flippedCardModal = showFlippedModal ? <Modal show={showFlippedModal}>
                              <Modal.Header><h2>You Flipped Over:</h2></Modal.Header>
                              <Modal.Body className="justify-content-md-center">
                                <Col sm={4}><PlayingCard card={flippedCard}/></Col>
                              </Modal.Body>
                              <Modal.Footer>
                                <Button variant="primary" onClick={()=>setShowFlippedModal(false)}>Close</Button>
                              </Modal.Footer>
                          </Modal>: null

  return (
    <div style={{width:'100%'}}>
    <Row className="alert-row">
      {flippedCardModal}
      {errorAlertItem}
    </Row>
    <Row style={{width:'100%'}}>
      <Col md={6} className="left-col">
          <Card bg="dark" className= "control-board">
            <Card.Header><h2 className={currentPlayerId == id ? "" : "grey"}>
              {currentPlayerId == id ? 'Your Turn!' : currentPlayerName + '\'s Turn'}
            </h2></Card.Header>
            <Card.Body>

              <Row style={{width:'100%'}} className="justify-content-md-center">
                  <Col sm={{span:4, offset:1}}> <h4>Deck</h4> {deckCounterItem} </Col>
                  <Col sm={{span:4, offset:1}}> <h4>Pile</h4> {topCardItem} </Col>
              </Row>

            </Card.Body>
            <Card.Footer className='footer'>{currentPlayerId == id ? playing : waiting} </Card.Footer>
          </Card>
      </Col>

      <Col md={6}>
        <Hand label='Hand' cards={hand} selected={chosenCards} onSelect={onSelect}/>
        <Hand label='Upcards' cards={uphand} selected={[]} onSelect={(cid)=> errorAlert('You can\'t access your upcards until the deck is empty and you\'ve used up your hand.')} deactivated={true}/>
        <Hand label='Downcards' cards={downhand} selected={[chosenDownCard]} onSelect={onSelectDowncard}/>
      </Col>
        {winnerId !== null ? <GameWon winnerId={winnerId} id={id}/> : null}
    </Row>
    </div>
  )
}

export default withRouter(TakeTurns)
