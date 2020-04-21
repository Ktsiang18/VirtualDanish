import React from 'react'
import './css/hand.css'

function Hand(props){
    const cardItems = props.cards.map((c) => {
      if(props.label == 'Downcards'){
        return <div>{'---'}</div>
      }
      let status = props.selected.find(e => e === c.id) !== undefined ? 'selected' : 'unselected'
      return <div className={status} key={c.id} onClick={() => {props.onSelect(c.id)}}>{c.name}</div>
    })

    return (
      <label>{props.label}
      <div className="flex-container">
        {cardItems}
      </div>
      </label>
    )
}

export default Hand
