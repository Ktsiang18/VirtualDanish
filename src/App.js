import React from 'react';
import {Route, Link, BrowserRouter as Router } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';

import Start from './components/start'
import Play from './components/play'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <div>
            <Route path = '/start' component={Start} />
            <Route path = '/play/:id' component={Play} />
          </div>
        </Router>
      </header>
    </div>
  );
}

export default App;
