import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'

function NameForm(props){
  const [name, setName] = useState('')

  const handleChange = (event) => {
    setName(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('/nameForm', {
      method: 'POST',
      body: JSON.stringify({ name: name }),
    })
    .then(res => res.json())
    .then(data =>{
      alert('Hello ' +  name +'!')
      props.history.push('/start/' + data.user.id + '/joinCreate')
    })

  }

    return (
        <form onSubmit={handleSubmit} method="post">
          <h1 className="title">Welcome to Danish!</h1>
          <label>
            Please enter your name:
            <input type="text" value={name} onChange={handleChange} />
            <input type="submit" value="Submit"/>
          </label>
        </form>

    );
}

export default withRouter(NameForm);
