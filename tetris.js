const ROWS = 20; // プレイフィールドの行数
const COLS = 10; // プレイフィールドの列数
const CELL_SIZE = 20; // セルのサイズ
const SHAPES = [
  [    [1, 1],
    [1, 1],
  ],
  [    [0, 2, 0],
    [2, 2, 2],
  ],
  [    [0, 3, 3],
    [3, 3, 0],
  ],
  [    [4, 4, 0],
    [0, 4, 4],
  ],
  [    [5, 5, 5, 5],
  ],
  [    [6, 6, 6],
    [0, 0, 6],
  ],
  [    [7, 7, 7],
    [7, 0, 0],
  ],
];
const COLORS = ["#fff",  "#0af",  "#f0a",  "#0f0",  "#a0f",  "#fa0",  "#0ff",  "#f0f",];
const SCORES = [40, 100, 300, 1200]; // 行を消したときの得点
const SPEEDS = [800, 600, 400, 200]; // レベルに応じた速度
const LEVEL_UP_SCORE = 1000; // レベルアップに必要なスコア

let gameBoard; // ゲームボード
let currentTetromino; // 現在操作中のテトロミノ
let nextTetromino; // 次のテトロミノ
let tetrominoes; // テトロミノの配列
let score; // スコア
let level; // レベル
let speed; // スピード
let isGameOver; // ゲームオーバーかどうかのフラグ

// ゲームを開始する
function startGame() {
  // 初期化
  gameBoard = new Array(ROWS);
  for (let i = 0; i < ROWS; i++) {
    gameBoard[i] = new Array(COLS).fill(0);
  }
  currentTetromino = getRandomTetromino();
  nextTetromino = getRandomTetromino();
  tetrominoes = SHAPES.map(shape => {
    return {
      shape: shape,
      x: 0,
      y: 0,
    };
  });
  score = 0;
  level = 1;
  speed = SPEEDS[level - 1];
  isGameOver = false;

  drawGameBoard();
  drawTetromino(currentTetromino);
  updateScore();
  updateLevel();
  updateSpeed();

  // ゲームループを開始する
  setInterval(() => {
    if (!isGameOver) {
      moveDown();
    }
  }, speed);
  
  moveDown();

  // キーボードのイベントリスナーを登録する
  document.addEventListener("keydown", handleKeyDown);
}

// ゲームオーバーの処理
function gameOver() {
  isGameOver = true;
  alert("Game over!");
}

// テトロミノをランダムに取得する
function getRandomTetromino() {
  const index = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[index];
  const x = Math.floor((COLS - shape[0].length) / 2);
  const y = -shape.length;
  return {
    shape: shape,
    x: x,
    y: y,
  };
}

// テトロミノを回転する
function rotateTetromino(tetromino) {
  const shape = tetromino.shape;
  const size = shape.length;
  const rotatedShape = new Array(size);
  for (let i = 0; i < size; i++) {
    rotatedShape[i] = new Array(size).fill(0);
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      rotatedShape[j][size - i - 1] = shape[i][j];
    }
  }
  return {
    shape: rotatedShape,
    x: tetromino.x,
    y: tetromino.y,
  };
}

// テトロミノを描画する
function drawTetromino(tetromino) {
  const shape = tetromino.shape;
  const color = COLORS[SHAPES.indexOf(shape)];
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] !== 0) {
        drawCell(tetromino.x + j, tetromino.y + i, color);
      }
    }
  }
}

// ゲームボードを描画する
function drawGameBoard() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const color = COLORS[gameBoard[i][j]];
      drawCell(j, i, color);
    }
  }
}

// セルを描画する
function drawCell(x, y, color) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.fillStyle = color;
  context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  context.strokeStyle = "#666";
  context.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// テトロミノを移動する
function moveTetromino(dx, dy) {
  const newTetromino = {
    shape: currentTetromino.shape,
    x: currentTetromino.x + dx,
    y: currentTetromino.y + dy,
  };
  if (isValidPosition(newTetromino)) {
    currentTetromino = newTetromino;
    drawGameBoard();
    drawTetromino(currentTetromino);
    return true;
  } else {
    return false;
  }
}

// テトロミノを下に落とす
function dropTetromino() {
  if (!moveTetromino(0, 1)) {
    fixTetromino();
    removeCompletedRows();
    currentTetromino = getNextTetromino();
    if (!isValidPosition(currentTetromino)) {
      gameOver();
      return;
    }
  }
}

// テトロミノを固定する
function fixTetromino() {
  const shape = currentTetromino.shape;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] !== 0) {
        const row = currentTetromino.y + i;
        const col = currentTetromino.x + j;
        gameBoard[row][col] = SHAPES.indexOf(shape) + 1;
      }
    }
  }
}

// 完成した行を削除する
function removeCompletedRows() {
  let numRowsRemoved = 0;
  for (let i = ROWS - 1; i >= 0; i--) {
    let rowIsComplete = true;
    for (let j = 0; j < COLS; j++) {
      if (gameBoard[i][j] === 0) {
        rowIsComplete = false;
        break;
      }
    }
    if (rowIsComplete) {
      gameBoard.splice(i, 1);
      gameBoard.unshift(new Array(COLS).fill(0));
      numRowsRemoved++;
      i++;
    }
  }
  if (numRowsRemoved > 0) {
    score += SCORES[numRowsRemoved - 1];
    updateScore();
  }
}

// スコアを更新する
function updateScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Score: ${score}`;
}

// テトロミノの位置が有効かどうかを判定する
function isValidPosition(tetromino) {
  const shape = tetromino.shape;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      const row = tetromino.y + i;
      const col = tetromino.x + j;
      if (
        row < 0 ||
        row >= ROWS ||
        col < 0 ||
        col >= COLS ||
        gameBoard[row][col] !== 0
      ) {
        return false;
      }
    }
  }
  return true;
}

// 指定したミリ秒数だけ待つ
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ゲームループ
async function gameLoop() {
  while (!isGameOver) {
    await sleep(GAME_SPEED);
    dropTetromino();
  }
}

// ゲームを開始する
function startGame() {
  initializeGame();
  currentTetromino = getNextTetromino();
  drawGameBoard();
  drawTetromino(currentTetromino);
  gameLoop();
}

// ゲームをリセットする
function resetGame() {
  gameBoard = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(0));
  score = 0;
  updateScore();
  isGameOver = false;
  startGame();
}

// ゲームオーバー
function gameOver() {
  isGameOver = true;
  alert(`Game Over! Your score is ${score}.`);
}

// ページが読み込まれたときにゲームを開始する
document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start");
  startButton.addEventListener("click", startGame);
  const resetButton = document.getElementById("reset");
  resetButton.addEventListener("click", resetGame);
});