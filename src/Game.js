import React, {Component} from 'react';
import GameBoard from './GameBoard';

const GAME_STATE = {
  'PAUSED': 0,
  'RUNNING': 1
}

export default class Game extends Component {

  constructor(props) {
    super(props);

    const {cellSize, boardRows, boardCols} = this.props;

    this.state = {
      canvas: null,
      context: null,
      view: {
        width: cellSize * boardCols,
        height: cellSize * boardRows
      },
      lastFrameTime: Date.now(),
      genTimer: 0,//track when to move to next generation
      genSpeedScale: 0.8,
      genSpeed: 500,//speed of each generation in milliseconds
      generation: 0,
      gameState: GAME_STATE.PAUSED
    }
  }

  componentDidMount() {
    const {boardRows, boardCols, cellSize} = this.props;
    const canvas = document.getElementById('game-view');
    const context = this.refs.canvas.getContext('2d');
    const board = new GameBoard({rows: boardRows, cols: boardCols, cellSize: cellSize || 48});
    board.initGrid();
    board.randomizeCellStates();
    this.setState({
      canvas: canvas,
      context: context,
      board: board
    });
    this.toggleSim();
    requestAnimationFrame(() => this.update());
  }

  handleClickCanvas(event) {
    const {board} = this.state;
    const {target} = event;
    const {offsetX, offsetY} = event.nativeEvent;//relative to element top left
    let cell = board.getCell(offsetX, offsetY);
    if (cell) {
      cell.set({alive: !cell.alive, age: 0});
    }
  }

  toggleSim() {
    const {gameState} = this.state;
    let nextState = gameState === GAME_STATE.RUNNING ? GAME_STATE.PAUSED : GAME_STATE.RUNNING;
    this.setState({
      gameState: nextState,
      genTimer: 0,
      lastFrameTime: Date.now()
    });
  }

  nextGeneration() {
    let {board} = this.state;
    board.grid.forEach((row) => {
      row.forEach((cell) => {
        let living = cell.alive;
        let count = cell.neighbors.reduce((acc, neighbor) => {
          return neighbor.alive ? acc+1 : acc
        }, 0);
        if (living && count < 2) {
          cell.nextState = {alive: false, age: 0};//cell dies
        }
        if (living && (count === 2 || count === 3)) {
          cell.nextState = {age: cell.age+1};//cell lives on
        }
        if (living && count > 3) {
          cell.nextState = {alive: false, age: 0};//cell dies
        }
        if (!living && count === 3) {
          cell.nextState = {alive: true, age: 0};//cell is born
        }
      });
    });
    board.grid.forEach((row) => {
      row.forEach((cell) => {
        cell.applyNextState();
      });
    });
    this.setState({
      generation: this.state.generation + 1
    });
  }

  update() {
    const {context, board, gameState, generation, genSpeed, genSpeedScale, genTimer, lastFrameTime} = this.state;
    const now = Date.now();
    const dt = now - lastFrameTime;

    if (gameState === GAME_STATE.RUNNING) {
      let timer = genTimer + dt;
      this.setState({genTimer: timer});
      if (timer >= genSpeed * (1.1 - genSpeedScale)) {
        this.setState({genTimer: timer - genSpeed});
        this.setState({
          genTimer: 0,
        });
        this.nextGeneration();
      }
    }
    this.setState({
      lastFrameTime: now
    });
    board.draw(context);
    requestAnimationFrame(() => this.update());
  }

  clearBoard() {
    const {board} = this.state;
    board.initGrid();
    this.setState({
      generation: 0
    });
  }

  randomizeBoard() {
    const {board} = this.state;
    board.randomizeCellStates();
    this.setState({
      generation: 0
    });
  }

  handleSpeedChange(event) {
    const {target} = event;
    const value = Number(target.value);
    this.setState({
      genSpeedScale: value
    });
  }

  render() {
    const {view, board, gameState, generation, genSpeed, genSpeedScale} = this.state;
    return (
      <div>
        <div>
          <div className='game-title'>Conway's Game of Life</div>
        </div>
        <div>
          <div className='board'>
            <div className='left container'>
              <span className='gen-title'>Generation: </span>
              <span className='gen-value'>{generation}</span>
            </div>
            <canvas id='game-view' ref='canvas' width={view.width} height={view.height} onClick={this.handleClickCanvas.bind(this)}/>
            <div className='container'>
              <span style={{width: '35%'}} className='inline left'>
                <button className='btn btn-next' onClick={() => this.nextGeneration()}>Next</button>
                <button className='btn btn-simulate' onClick={this.toggleSim.bind(this)}>{gameState === GAME_STATE.PAUSED ? 'Start' : 'Pause'}</button>
              </span>
              <span style={{width: '30%'}} className='inline center'>
                <div className='center ctl-speed-container'>
                  <div className='ctl-speed-title'>Speed</div>
                  <input onChange={this.handleSpeedChange.bind(this)} type='range' min='0' max='1' value={genSpeedScale} step='0.1' />
                </div>
              </span>
              <span style={{width: '35%'}} className='inline right'>
                <button className='btn btn-clear' onClick={() => this.clearBoard()}>Clear</button>
                <button className='btn btn-random' onClick={() => this.randomizeBoard()}>Random</button>
              </span>
            </div>
          </div>
          <div className='footer'>
            <div>Ryan Ledford</div>
            <div>2017</div>
          </div>
        </div>
      </div>
    );
  }
}