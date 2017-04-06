import Cell from './Cell';

export default class GameBoard {
  constructor(args) {
    this.cols = args.cols;
    this.rows = args.rows;
    this.cellSize = args.cellSize;
    this.grid = null;
  }

  resizeGrid(width, height) {
    this.cols = width;
    this.rows = height;
    this.initGrid();
  }

  initGrid() {
    delete this.grid;
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.cols; col++) {
        let cell = new Cell();
        this.grid[row].push(cell);
      }
    }
    this.linkCellNeighbors();
  }

  randomizeCellStates() {
    this.grid.forEach((row) => {
      row.forEach((cell) => {
        cell.reset();
        cell.alive = Math.random() > 0.8;
        cell.age = 0;
      })
    })
  }

  linkCellNeighbors() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let cell = this.grid[r][c];
        for (let row = r-1; row <= r+1; row++) {
          for (let col = c-1; col <= c+1; col++) {
            if (c === col && r === row) continue;
            let rIndex = row,
                cIndex = col;
            if (row < 0) {
              rIndex = this.rows + row;
            } else if (row >= this.rows) {
              rIndex = row - this.rows;
            }
            if (col < 0) {
              cIndex = this.cols + col;
            } else if (col >= this.cols) {
              cIndex = col - this.cols;
            }
            cell.neighbors.push(this.grid[rIndex][cIndex]);
          }
        }
      }
    }
  }

  resetGrid() {
    this.grid.forEach((row) => row.forEach((cell) => cell.reset));
  }

  /**
   * the provided x,y coordinates should be unprojected from screen to canvas
   * @param {*} x
   * @param {*} y 
   */
  getCell(x, y) {
    //convert x,y to col,row
    const col = Math.floor(x/this.cellSize);
    const row = Math.floor(y/this.cellSize);
    if (col >= 0 && col < this.cols && row >= 0 && row <= this.rows) {
      return this.grid[row][col];
    } else {
      return null;
    }
  }

  /**
   * 
   * @param {Context} ctx - canvas context
   */
  draw(ctx) {
    if (!this.grid) return;
    const size = this.cellSize;
    ctx.clearRect(0, 0, this.cols*this.cellSize, this.rows*this.cellSize);
    ctx.strokeStyle = 'gray';
    ctx.strokeRect(0, 0, this.cols*this.cellSize, this.rows*this.cellSize);
    for (let x = this.cellSize - 1; x < (this.cols-1)*this.cellSize; x+=this.cellSize){
      ctx.beginPath();
      ctx.moveTo(x+1, 0);
      ctx.lineTo(x+1, this.rows*this.cellSize);
      ctx.stroke();
    }
    for (let y = this.cellSize -1; y < (this.rows-1)*this.cellSize; y+=this.cellSize){
      ctx.beginPath();
      ctx.moveTo(0, y+1);
      ctx.lineTo(this.cols*this.cellSize, y+1);
      ctx.stroke();
    }
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let cell = this.grid[row][col];
        if (!cell.alive) continue;
        let innerColor = cell.age > 3 ? 'darkgoldenrod' : 'goldenrod';
        let outerColor = cell.age > 3 ? 'goldenrod': 'darkgoldenrod';
        ctx.fillStyle = innerColor
        ctx.beginPath();
        ctx.arc(col * size + size*0.5, row * size + size*0.5, size*0.33, 0, Math.PI*2, true);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle= outerColor;
        ctx.arc(col * size + size*0.5, row * size + size*0.5, size*0.5, 0, Math.PI*2, true);
        ctx.stroke();
      }
    }
  }
}