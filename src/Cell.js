export default class Cell {
  constructor() {
    this.alive = false;
    this.age = 0;
    this.neighbors = [];
    this.nextState = null;
  }

  reset() {
    this.alive = false;
    this.age = 0;
    this.nextState = null;
  }

  applyNextState() {
    if (this.nextState) {
      Object.keys(this.nextState).forEach((key) => {
        this[key] = this.nextState[key];
      });
      this.nextState = null;
    }
  }

  set(args) {
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });
  }
}