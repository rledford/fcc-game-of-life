import React, { Component } from 'react';
import './App.css';

import Game from './Game';
import './styles.css';

class App extends Component {
  render() {
    return (
      <Game cellSize={12} boardRows={30} boardCols={50}/>
    );
  }
}

export default App;
