import React, {useState, useEffect} from 'react'
import Hand from './hand'
import {useParams, withRouter} from 'react-router-dom'
import {Button, Modal, Col, Row, Card, Alert} from 'react-bootstrap'
import './css/play.css'
function Swap(props){
    let {id, game_id} = useParams()
    const [uphand , setUphand] = useState([])
    const [downhand , setDownhand] = useState([])
    const [hand , setHand] = useState([])
    const [selectedHand, setSelectedHand] = useState(-1)
    const [selectedUp, setSelectedUp]= useState(-1)
    const [showErrorAlert, setShowErrorAlert] = useState(false)

    useEffect(() => {
        props.getCards(id)
        .then(result => {
          setUphand(result.cards.uphand)
          setDownhand(result.cards.downhand)
          setHand(result.cards.hand)
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
      .then(() => {
        props.history.push('/play/' + id + '/'+ game_id +'/turn/')
      })
    }

    const errorAlertItem = <Row><Alert variant="danger" show={showErrorAlert} onClose={()=>setShowErrorAlert(false)} dismissible>
                                  <Alert.Heading>Oops!</Alert.Heading>
                                  <p className="smaller-p">You can't use your down cards <strong>yet</strong></p>
                            </Alert>
                          </Row>

    return (
    <div>
    <Row className="alert-row">
      {errorAlertItem}
    </Row>
    <Row>
        <Col sm={5} className="left-col">
          <Card bg="dark">
            <Card.Body>
              <Card.Title><h2> Time to Swap!</h2></Card.Title>
              <p className="smaller-p">
              Here's your one chance to swap any of your <span className="orange"> upcards </span>
              (used at the end of the game)
               with cards in your hand.
              </p>
            </Card.Body>
            <Card.Footer className='footer'>
               <span className="grey"> HINT: you probably want some good cards in your uphand! </span>
            </Card.Footer>
          </Card>
          <div className="big-button">
            <Button variant="outline-success" onClick={onSubmit}>Finished Swapping</Button>
          </div>
        </Col>
          <Col md={6}>
            <Hand label='Hand' cards={hand} selected={[selectedHand]} onSelect={onSelect(selectedHand, setSelectedHand)} />
            <Hand label='Upcards' cards={uphand} selected={[selectedUp]} onSelect={onSelect(selectedUp, setSelectedUp)}/>
            <Hand label='Downcards' cards={downhand} selected={[]} onSelect={() => setShowErrorAlert(true)}/>


          </Col>
      </Row>
      </div>
    )
}

export default withRouter(Swap)
