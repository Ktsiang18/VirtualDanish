import React, {useEffect, useState} from 'react'
import {useParams, withRouter} from 'react-router-dom'
import {Card, ListGroup, CardDeck, Spinner, Button, Alert} from 'react-bootstrap'
import Constants from '../../constants.js'
import '../css/start.css'

function WaitingForm(props){
  let {id} = useParams()

  const [is_admin , setIsAdmin] = useState(false)
  const [admin_name, setAdminName] = useState('')
  const [game_id, setGameId] = useState('')
  const [code, setCode] = useState('')
  const [users, setUsers] = useState([])
  const [waiting, setWaiting] = useState(true)

  let path = '/play/'+id+'/'+game_id+'/swap/'
  const fetchUser = async() => await fetch(Constants.PROXY +'/fetchUser/'+id)
  const fetchGame = async(user) => await fetch(Constants.PROXY +'/fetchGame/'+ user.game_id)

  useEffect(()=>{
    fetchUser()
    .then(res => res.json())
    .then((data)=>{
      setIsAdmin(data.user.isAdmin)

      fetchGame(data.user)
      .then(res => res.json())
      .then((data)=> {
        setUsers(data.game.users)
        setCode(data.game.code)
        setGameId(data.game.id)

        setAdminName((data.game.users.find(u => u.isAdmin)).username)
      })
    })
  }, [id])

  const initializeGame = () => {
    fetch(Constants.PROXY +'/initGame', {
      method:'POST',
      body:JSON.stringify({
        game_id: game_id
      })
    })
    .then(() => {
      props.history.push(path)
    })
  }

  const start_button = <Button variant="primary" onClick={initializeGame}>Start game!</Button>
  const go_button = <Button variant="success" onClick={()=>props.history.push(path)}>Let's go!</Button>
  const waiting_button = <Button variant="secondary" disabled>
                            <Spinner animation="grow" as="span" size="sm"/>
                             &nbsp; Waiting for {admin_name} to start the game...
                          </Button>

  const gameStartedAlert = <div className="float-top">
                  <Alert
                    className='hello-alert'
                    show={!waiting}
                    variant='success'
                    >
                    <Alert.Heading> <strong>{admin_name} started the game!</strong> </Alert.Heading>
                    <p className="smaller-p">
                      Click <strong className="green">Let's go</strong> to start playing.
                    </p>
                  </Alert>
                </div>

  //Pusher channel to wait for player to join
  props.pusherChannel.bind('joining-game-'+game_id, function(data) {
    setUsers(data.game_users)
  });

  //Pusher channel to wait for admin to start the game
  props.pusherChannel.bind('init-game-'+game_id, function(data) {
    setWaiting(false)
  });

  return (
      <div>
      {gameStartedAlert}
          <div className="ready-set">
            <span className="orange"> Ready... </span>
            <span className="pink"> Set... </span>
          </div>
        <CardDeck>

          <Card bg="dark" className="align-left">
            <Card.Header className="smaller-p">Your Game's Code</Card.Header>
            <Card.Body>
              <Card.Title><h2>{code}</h2></Card.Title>
              <Card.Text className="smaller-p">
                Send this code to your friends so they can join this game.
                When everyone has joined, {is_admin ? "press start game" : admin_name + " will start the game"}.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card bg="primary" className="align-left">
            <Card.Header className="smaller-p">Players</Card.Header>
            <Card.Body>
              <Card.Title><h3>Who's Joined</h3></Card.Title>
            </Card.Body>
            <ListGroup>
              {users.map((user, i) =>
                <ListGroup.Item className="list-item" variant="primary" key={user.id}>
                  {i+1}. {user.username} {user.isAdmin ? <span>&#9819;</span> : ''}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

        </CardDeck>
            {is_admin ? start_button : ( waiting ? waiting_button : go_button )}
      </div>
  );
}

export default withRouter(WaitingForm);
