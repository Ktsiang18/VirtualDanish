import React, {useEffect, useState} from 'react'
import {Link, useParams, withRouter} from 'react-router-dom'
import {Modal, Button, Card} from 'react-bootstrap'
import './css/play.css'

function GameWon(props) {
  const id = props.id
  const winner_id = props.winnerId
  const [winnerName, setWinnerName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const isWinner = id===winner_id

  const getWinner = () => {
    fetch('/fetchUser/' + winner_id)
    .then(res => res.json())
    .then(data => {
      setWinnerName(data.user.username)
      setShowModal(true)
    })
  }

  const restartGame = () => {
    clearGame()
    props.history.push('/')
  }

  const clearGame = () => {
    fetch('/clearGame', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id
      })
    })
  }

  useEffect(() => {
      getWinner()
  }, [])

    const winItem =
        <Card.Body>
          <Card.Title><h3>Congratulations!</h3></Card.Title>
          <Card.Text className='smaller-p'>Good job {winnerName || ''}, you won &#127942;</Card.Text>
        </Card.Body>

    const loseItem =
        <Card.Body>
          <Card.Title><h3>Sorry</h3></Card.Title>
          <Card.Text className='smaller-p'><strong>{winnerName || ''}</strong> won the game, better luck next time!</Card.Text>
        </Card.Body>

    return (

      <Modal show={showModal}>
        <Card text="light" bg={isWinner ? "success" : "danger"}>
          <Card.Header className="smaller-p">Game Over</Card.Header>
            {isWinner ? winItem : loseItem}
          <Card.Footer className='footer'>
            <Button variant="outline-light" onClick={restartGame}>Play Again!</Button>
          </Card.Footer>
        </Card>
      </Modal>
    )

}

export default withRouter(GameWon)
