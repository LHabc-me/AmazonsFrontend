class Chess {
  static EMPTY = 0;
  static BLACK = 1;
  static WHITE = -1;
  static ARROW = 2;
}

class Stage {
  static CHESS = 0;
  static ARROW = 1;
}

class Game {
  constructor({ boardSize, isBlackFirst }) {
    this.boardSize = boardSize;
    this.isBlackFirst = isBlackFirst;
    this.board = Array.from({ length: boardSize }, () => Array(boardSize).fill(Chess.EMPTY));
    const [blackChessPositions, whiteChessPositions] = initChessPositions(boardSize);
    blackChessPositions.forEach(([x, y]) => this.board[x][y] = Chess.BLACK);
    whiteChessPositions.forEach(([x, y]) => this.board[x][y] = Chess.WHITE);
    this.round = 0; // 当前回合数
    this.stage = Stage.CHESS; // 当前步骤
    this._history = [];
  }

  // 判断是否是黑棋回合
  isBlackTurn() {
    if (this.isBlackFirst) {
      return this.round % 2 === 0;
    } else {
      return this.round % 2 === 1;
    }
  }

  isWhiteTurn() {
    return !this.isBlackTurn();

  }

  isFirstPlayerTurn() {
    return ((this.isBlackFirst && this.isBlackTurn()) ||
      (!this.isBlackFirst && !this.isBlackTurn()));
  }

  isSecondPlayerTurn() {
    return !this.isFirstPlayerTurn();
  }

  isBlack(x, y) {
    return this.board[x][y] === Chess.BLACK;
  }

  isWhite(x, y) {
    return this.board[x][y] === Chess.WHITE;
  }

  getLegalMoves(chessPosition) {
    if (!this._isMatch(chessPosition)) {
      return [];
    }

    // 向八个方向移动，直到遇到障碍或者边界或者其他棋子
    const legalMoves = [];
    const [x, y] = chessPosition;
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      while (this._isLegalPosition([nx, ny])) {
        if (this.board[nx][ny] === Chess.EMPTY) {
          legalMoves.push([nx, ny]);
        } else {
          break;
        }
        nx += dx;
        ny += dy;
      }
    }
    return legalMoves;
  }

  canMove() {
    const chess = this.isBlackTurn() ? Chess.BLACK : Chess.WHITE;
    const chessPositions = [];
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        if (this.board[x][y] === chess) {
          chessPositions.push([x, y]);
        }
      }
    }
    return chessPositions.some(position => this.getLegalMoves(position).length > 0);
  }


  play(from, to) {
    if (this.stage === Stage.CHESS) {
      this._playChess(from, to);
      this._recordHistory(from, to);
      this.stage = Stage.ARROW;
    } else if (this.stage === Stage.ARROW) {
      this._playArrow(from, to);
      this._recordHistory(from, to);
      this.stage = Stage.CHESS;
    }
  }

  undo() {
    if (this._history.length <= 0) {
      return false;
    }
    const { from, to, move, stage } = this._history[this._history.length - 1];
    if (stage === Stage.CHESS) {
      this.board[from[0]][from[1]] = this.board[to[0]][to[1]];
      this.board[to[0]][to[1]] = Chess.EMPTY;
    } else if (stage === Stage.ARROW) {
      this.board[to[0]][to[1]] = Chess.EMPTY;
    }
    this.round = move;
    this.stage = stage;
    this._history.pop();
    return true;
  }

  getHistoryAsArray() {
    // 处理为[[fromX, fromY, toX, toY, arrowX, arrowY],...]
    const result = [];
    for (let i = 1; i < this._history.length; i += 2) {
      const { from, to } = this._history[i - 1];
      const { to: arrow } = this._history[i];
      result.push([from[0], from[1], to[0], to[1], arrow[0], arrow[1]]);
    }
    return result;
  }

  _playChess(from, to) {
    if (!this._isMatch(from) || !this._isEmpty(to)) {
      this._invalidMove();
    }
    const legalMoves = this.getLegalMoves(from);
    if (!legalMoves.some(([x, y]) => x === to[0] && y === to[1])) {
      this._invalidMove();
    }
    this.board[to[0]][to[1]] = this.board[from[0]][from[1]];
    this.board[from[0]][from[1]] = Chess.EMPTY;
  }

  _playArrow(from, to) {
    if (!this._isMatch(from) || !this._isEmpty(to)) {
      this._invalidMove();
    }
    this.board[to[0]][to[1]] = Chess.ARROW;
    this.round += 1;
  }

  _isLegalPosition(chessPosition) {
    const [x, y] = chessPosition;
    return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
  }

  _isMatch(chessPosition) {
    if (!this._isLegalPosition(chessPosition)) {
      return false;
    }
    const chess = this.board[chessPosition[0]][chessPosition[1]];
    if (chess === Chess.BLACK && !this.isBlackTurn()) {
      return false;
    } else if (chess === Chess.WHITE && this.isBlackTurn()) {
      return false;
    }
    return true;
  }

  _isEmpty(chessPosition) {
    if (!this._isLegalPosition(chessPosition)) {
      return false;
    }
    return this.board[chessPosition[0]][chessPosition[1]] === Chess.EMPTY;
  }

  _recordHistory(from, to) {
    this._history.push({
      from,
      to,
      move: this.round,
      stage: this.stage
    });
  }

  _invalidMove() {
    throw new Error("Invalid move");
  }
}

function initChessPositions(boardSize) {
  if (boardSize === 8) {
    return [
      [[0, 2], [2, 0], [5, 0], [7, 2]],
      [[0, 5], [2, 7], [5, 7], [7, 5]]
    ];
  } else if (boardSize === 10) {
    return [
      [[0, 3], [3, 0], [6, 0], [9, 3]],
      [[0, 6], [3, 9], [6, 9], [9, 6]]
    ];
  }
}


export { Chess, Game, Stage, initChessPositions };
