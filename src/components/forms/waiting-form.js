import React, {useEffect, useState} from 'react'
import {Link, useParams, withRouter} from 'react-router-dom'

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
  props.pusherChannel.bind('joining-game-'+game_id, function(data) {
    setUserItems(data.game_users.map((user) => <li key={user.id}>{user.username}</li>))
  });

  //Pusher channel to wait for admin to start the game
  props.pusherChannel.bind('init-game-'+game_id, function(data) {
    props.history.push(path)
  });

  const initializeGame = () => {
    fetch('/initGame', {
      method:'POST',
      body:JSON.stringify({
        game_id: game_id
      })
    })
    .then(() => {
      props.history.push(path)
    })
  }

  const start_button = <button onClick={initializeGame}>Start game!</button>
  return (
      <div>
        <h1 className="title">Welcome to Danish!</h1>
        <div>Code for current game: {code}
          <ul>Current players:
            {userItems}
          </ul>
            {is_admin ? start_button : 'Waiting for game to start'}
        </div>
      </div>
  );
}

export default withRouter(WaitingForm);
