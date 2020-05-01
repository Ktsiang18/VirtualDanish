import React, {useState} from 'react'
import PlayingCard from './card'
import './css/play.css'
import {Card, CardDeck, Row, Col} from 'react-bootstrap'

function Hand(props){

    const [tooltipText, setTooltipText] =useState('')

    const cardItems = props.cards.map((c) =>
      <Col sm={{span:3}}>
        <PlayingCard
          card={c}
          onSelect={props.onSelect}
          isSelected={props.selected.find(e => e === c.id) !== undefined}
          isDowncard={props.label=='Downcards'}
          deactivated={props.deactivated}
        />
      </Col>
      )

    return (
      <React.Fragment>
        <Row className="hand-label">
          <h5>{props.cards.length > 0 ? props.label : ''}</h5>
        </Row>
        <Row>
          {cardItems}
        </Row>
      </React.Fragment>
    )
}

export default Hand
