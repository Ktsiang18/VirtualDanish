import React, {useState, useEffect} from 'react'
import {withRouter, useParams} from 'react-router-dom'
import {Button, Alert, Form, InputGroup, Col, Row, Accordion, useAccordionToggle } from 'react-bootstrap';

import '../css/start.css'

function JoinCreateForm(props){
  let {id} = useParams()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [showCodeError, setShowCodeError] = useState(false)

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
            props.history.push('/start/'+ id + '/waiting')
          } else {
            setShowAlert(false)
            setShowCodeError(true)
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

  useEffect(() => {
    fetch('/fetchUser/' + id)
    .then(res => res.json())
    .then(data => {
      setName(data.user.username)
      setShowAlert(true)
    })
  }, [])

  const welcomeAlert = <div className="float-top">
                  <Alert
                    className='hello-alert'
                    show={showAlert}
                    variant='primary'
                    onClose={()=>setShowAlert(false)}
                    dismissible>
                    <Alert.Heading> <strong>Hello {name}!</strong> </Alert.Heading>
                    <p className="smaller-p">
                      Excited to play? Let's get you signed up for a game!
                    </p>
                  </Alert>
                </div>

  const codeErrorAlert = <div className="float-top">
                  <Alert
                    className='hello-alert'
                    show={showCodeError}
                    variant='danger'
                    onClose={()=>setShowCodeError(false)}
                    dismissible>
                    <Alert.Heading> <strong>Oops!</strong> </Alert.Heading>
                    <p className="smaller-p">
                      Looks like the code you entered does not exist. Try again!
                    </p>
                  </Alert>
                </div>

  const AccordionButton = ({eventKey, children}) => {
    const decoratedOnClick = useAccordionToggle(eventKey, () => null)

    return (
      <Button
        variant="outline-light"
        value="Join Game"
        onClick={decoratedOnClick}
        >
        {children}
      </Button>)
  }
  return (
    <div>
        {welcomeAlert}
        {codeErrorAlert}
    <div className="title">
      <div className="question ">Got an invite?</div>
      <p className="prompt">
        Use your invite code to <strong className="green">join</strong> an existing game,
         <br/> otherwise you can <strong className="pink">start</strong> a new game<
        /p>
      </div>
      <Form>
        <Form.Row>
          <Col>
            <Accordion>
                <AccordionButton eventKey="0">Join a Game</AccordionButton>
                <Accordion.Collapse eventKey="0">
                  <InputGroup>
                    <Form.Control placeholder="Enter code" onChange={handleChange}></Form.Control>
                    <InputGroup.Append>
                        <Button type="submit" variant="primary" value="Submit" onClick={handleSubmit}>Join!</Button>
                    </InputGroup.Append>
                  </InputGroup>
                </Accordion.Collapse>
            </Accordion>
          </Col>
          <Col>
            <Button variant="outline-light" onClick={newGame}>Start a New Game</Button>
          </Col>
          </Form.Row>
        </Form>
    </div>
  );
}


export default withRouter(JoinCreateForm);
