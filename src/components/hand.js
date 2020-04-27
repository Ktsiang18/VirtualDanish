import React from 'react'
import './css/hand.css'

function Hand(props){
    const cardItems = props.cards.map((c) => {
      let status = (props.selected.find(e => e === c.id) !== undefined) ? 'selected' : 'unselected'
      let label = props.label == 'Downcards' ? '---' : c.name

      return <div key={c.id} className={status} onClick={() => {props.onSelect(c.id)}}>{label}</div>
    })

    return (
      <label>{props.cards.length > 0 ? props.label : ''}
      <div className="flex-container">
        {cardItems}
      </div>
      </label>
    )
}

export default Hand
