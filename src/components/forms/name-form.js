import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import '../css/start.css'

import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Constants from '../../../constants.js'
function NameForm(props){
  const [name, setName] = useState('')

  const handleChange = (event) => {
    setName(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch(Constants.proxy + '/nameForm', {
      method: 'POST',
      body: JSON.stringify({ name: name }),
    })
    .then(res => res.json())
    .then(data =>{
        props.history.push('/start/' + data.user.id + '/joinCreate')
    })

  }

    return (
      <div>
        <div className="title">
          <div className="lets">Let's</div>
          <div className="play">Play</div>
          <div className="danish">Danish</div>
        </div>
          <Form onSubmit={handleSubmit} method="post">
            <InputGroup>
              <Form.Control type="text" placeholder="What's your name?" value={name} onChange={handleChange} />
              <InputGroup.Append>
                <Button type="submit" variant="primary" value="Submit">Go!</Button>
              </InputGroup.Append>
            </InputGroup>

          </Form>
        </div>
    );
}

export default withRouter(NameForm);
