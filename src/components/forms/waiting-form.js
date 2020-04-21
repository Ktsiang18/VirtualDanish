import React, {useEffect, useState} from 'react'
import {Link, useParams, withRouter} from 'react-router-dom'
import Pusher from 'pusher-js'
import Constants from '../../constants'

function WaitingForm(props){
  let {id} = useParams()

  const [is_admin , setAdmin] = useState(false)
  const [game_id, setGameId] = useState('')
  const [code, setCode] = useState('')
  const [userItems, setUserItems] = useState(null)

  let path = '/play/'+id+'/'+game_id+'/swap/'
  const fetchUser = async() => await fetch('/fetchUser/'+id)
  const fetchGame = async(user) => await fetch('/fetchGame/'+ user.game_id)

  useEffect(()=>{
    fetchUser()
    .then(res => res.json())
    .then((data)=>{
      setAdmin(data.user.isAdmin)

      fetchGame(data.user)
      .then(res => res.json())
      .then((data)=> {
        setUserItems(data.game.users.map((user) => <li key={user.id}>{user.username}</li>))
        setCode(data.game.code)
        setGameId(data.game.id)
      })
    })
  }, [id])

  //Pusher channel to wait for player to join
  const pusher = new Pusher(Constants.PUSHER_APP_ID, Constants.PUSHER_OPTIONS);
  const channel = pusher.subscribe(Constants.PUSHER_CHANNEL);

  channel.bind('joining-game-'+game_id, function(data) {
    setUserItems(data.game_users.map((user) => <li key={user.id}>{user.username}</li>))
  });

  //Pusher channel to wait for admin to start the game
  channel.bind('init-game-'+game_id, function(data) {
    console.log('recieved pusher event!')
    props.history.push(path)
  });

  const initializeGame = () => {
    fetch('/initGame', {
      method:'POST',
      body:JSON.stringify({
        game_id: game_id
      })
    })
  }

  const start_button = <Link to={path}><button onClick={initializeGame}>Start game!</button></Link>
  return (
      <div>Code for current game: {code}
        <ul>Current players:
          {userItems}
        </ul>
          {is_admin ? start_button : 'Waiting for game to start'}
      </div>
  );
}

export default withRouter(WaitingForm);
