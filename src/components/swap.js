import React, {useState, useEffect} from 'react'
import Hand from './hand'
import {useParams, Link} from 'react-router-dom'

function Swap(props){
    let {id, game_id} = useParams()
    const [uphand , setUphand] = useState([])
    const [downhand , setDownhand] = useState([])
    const [hand , setHand] = useState([])
    const [selectedHand, setSelectedHand] = useState(-1)
    const [selectedUp, setSelectedUp]= useState(-1)

    useEffect(() => {
        props.getCards(id)
        .then(result => {
          setUphand(result.uphand)
          setDownhand(result.downhand)
          setHand(result.hand)
        })

    },[id]);

    useEffect(() => {
        if(selectedHand > -1 && selectedUp > -1){

          const handCard = hand.find(c => c.id === selectedHand)
          const upCard = uphand.find(c => c.id === selectedUp)

          setHand(hand.map(c => (c.id === selectedHand ? upCard : c)))
          setUphand(uphand.map(c => (c.id === selectedUp ? handCard : c)))

          setSelectedHand(-1)
          setSelectedUp(-1)
        }
    })

    const onSelect = (selected, setSelected) => (card_id) => {
      if(selected==card_id){
        setSelected(-1)
      } else {
        setSelected(card_id)
      }
    }

    const onSubmit = () => {
     const newCards = {
        uphand: uphand.map(c => c.id),
        hand: hand.map(c => c.id)
      }

      props.setCards(id, newCards)
    }

    return (
      <div>
        <h2>Time to swap!</h2>
        <Hand label='Downcards' cards={downhand}/>
        <Hand label='Upcards' cards={uphand} selected={[selectedUp]} onSelect={onSelect(selectedUp, setSelectedUp)}/>
        <Hand label='Hand' cards={hand} selected={[selectedHand]} onSelect={onSelect(selectedHand, setSelectedHand)} />
        <Link to={'/play/' + id + '/'+ game_id +'/turn/'}>
          <button onClick={onSubmit}>Submit</button>
        </Link>
      </div>
    )
}

export default Swap
