import React from 'react'
import {Card} from 'react-bootstrap'
import './css/play.css'

function PlayingCard(props){
  const suits = {
    'C': <span>&#9827;</span>,
    'S': <span>&#9824;</span>,
    'D': <span className="symbol-red">&#9830;</span>,
    'H': <span className="symbol-red">&#x2665;</span>,
    '': <span>&nbsp;</span>
  }
  const icons = (card) => {
    switch(card.value) {
      case -1:
        return <span></span>
      case 2:
        // setTooltipText('Playable at any time')
        return <span>&#9889;</span>
      case 7:
      //   setTooltipText('Next player must play a card lower than 7')
        return <span>&#9889;</span>
      case 8:
        // setTooltipText('Skips the next player')
        return <span>&#9889;</span>
      case 10:
        // setTooltipText('Resets the pile, playable at anytime')
        return <span>&#9889;</span>
      case 14:
        // setTooltipText('Highest card in the deck!')
        return <span>&#9889;</span>
      default:
        return <span onClick={()=>alert('no power :(')}>&#9729;</span>
    }
  }
  const card = props.card
  const name = props.isDowncard ? <h1>&#9919;</h1> : card.name.slice(1)
  const suit = props.isDowncard ? '?' : suits[card.suit]
  const icon = props.isDowncard ?  <span></span> : icons(card)

  let color = 'light'
  let text = 'dark'

  if (props.isDowncard){
    color = 'dark'
    text = 'secondary'
  }
  if (props.isSelected){
    color='primary'
    text='light'
  }
  if(props.deactivated ){
    color='secondary'
    text='light'
  }

  return (
    <Card
      bg={color}
      text={text}
      key={card.id}
      className="card"
      onClick={() => {props.onSelect(card.id)}}
    >
      <Card.Header className="card-header">{suit}</Card.Header>
      <Card.Body>
      <Card.Title className='card-value'><h2>{name}</h2></Card.Title>
      </Card.Body>
      <footer className="footer">
          {icon}
      </footer>
    </Card>
  )
}

export default PlayingCard
