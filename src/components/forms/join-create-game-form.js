import React, {useState} from 'react'
import {withRouter, useParams} from 'react-router-dom'

function JoinCreateForm(props){
  let {id} = useParams()
  const [code, setCode] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('/joinGame', {
        method:'POST',
        body:JSON.stringify({
          code: code,
          user_id: id,
        })
    })
    .then(res => res.json())
    .then(data => {
          if(data.game_id){
            alert('Joining game ' + data.game_code +'!')
            props.history.push('/start/'+ id + '/waiting')
          } else {
            alert('Invalid code, please try again')
          }
    })
  }

  const newGame = (event) => {
    fetch('/createGame', {
      method: 'POST',
      body: JSON.stringify({
        user_id: id
      })
    })
    .then(res => res.json())
    .then(data => {
      props.history.push('/start/'+ id + '/waiting')
    })
  }

  const handleChange = (event) => {
    setCode(event.target.value)
  }

  return (
    <div>
      <h1 className="title">Welcome to Danish!</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your code to join an existing game:
          <input type="text" value={code} onChange={handleChange} />
          <input type="submit" value="Join Game"/>
        </label>
      </form>
      <label>Or start a new game
          <button onClick={newGame}>Create New Game</button>
      </label>
    </div>
  );
}


export default withRouter(JoinCreateForm);
