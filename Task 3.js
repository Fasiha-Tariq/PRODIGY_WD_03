const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const changeModeBtn = document.getElementById("changeMode");
const winningLine = document.getElementById("winning-line");

// Scoreboard elements
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

// Modals
const startModal = document.getElementById("startModal");
const humanVsHumanBtn = document.getElementById("humanVsHuman");
const humanVsAIBtn = document.getElementById("humanVsAI");
const endModal = document.getElementById("endModal");
const endMessage = document.getElementById("endMessage");
const playAgainBtn = document.getElementById("playAgain");

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let vsAI = false;

// Score tracking
let score = { X: 0, O: 0, Draw: 0 };

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Show start modal on load
window.onload = () => {
  startModal.style.display = "flex";
};

humanVsHumanBtn.addEventListener("click", () => {
  vsAI = false;
  startModal.style.display = "none";
  changeModeBtn.style.display = "inline-block";
  resetBoard();
});

humanVsAIBtn.addEventListener("click", () => {
  vsAI = true;
  startModal.style.display = "none";
  changeModeBtn.style.display = "inline-block";
  resetBoard();
});

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);

changeModeBtn.addEventListener("click", () => {
  vsAI = !vsAI;
  alert(vsAI ? "Switched to Human vs AI 🤖" : "Switched to Human vs Human 👥");
  resetBoard();
});

playAgainBtn.addEventListener("click", () => {
  endModal.style.display = "none";
  resetBoard();
});

function handleCellClick(e) {
  const index = e.target.getAttribute("data-index");
  if (gameState[index] !== "" || !gameActive) return;

  makeMove(index, currentPlayer);

  if (vsAI && gameActive && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  cells[index].textContent = player;

  if (checkWin(player)) {
    statusText.textContent = `🎉 Player ${player} Wins!`;
    updateScore(player);
    showEndModal(`🎉 Player ${player} Wins!`);
    gameActive = false;
  } else if (gameState.every(cell => cell !== "")) {
    statusText.textContent = "😮 It's a Draw!";
    updateScore("Draw");
    showEndModal("😮 It's a Draw!");
    gameActive = false;
  } else {
    currentPlayer = player === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
    winningLine.style.display = "none";
  }
}

function checkWin(player) {
  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
      cells[a].classList.add("win");
      cells[b].classList.add("win");
      cells[c].classList.add("win");
      drawWinningLine(a, b, c);
      return true;
    }
  }
  return false;
}

function drawWinningLine(a, b, c) {
  const cellA = cells[a].getBoundingClientRect();
  const cellC = cells[c].getBoundingClientRect();
  const board = document.querySelector(".board").getBoundingClientRect();

  const x1 = cellA.left + cellA.width / 2 - board.left;
  const y1 = cellA.top + cellA.height / 2 - board.top;
  const x2 = cellC.left + cellC.width / 2 - board.left;
  const y2 = cellC.top + cellC.height / 2 - board.top;

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  winningLine.style.width = `${length}px`;
  winningLine.style.transform = `rotate(${angle}deg)`;
  winningLine.style.left = `${x1}px`;
  winningLine.style.top = `${y1}px`;
  winningLine.style.display = "block";
}

// ✅ AI logic
function aiMove() {
  const bestMove = getBestMove();
  makeMove(bestMove, "O");
}

function getBestMove() {
  // Win if possible
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      gameState[i] = "O";
      if (checkWin("O")) {
        gameState[i] = "";
        return i;
      }
      gameState[i] = "";
    }
  }

  // Block opponent
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      gameState[i] = "X";
      if (checkWin("X")) {
        gameState[i] = "";
        return i;
      }
      gameState[i] = "";
    }
  }

  // Take center
  if (gameState[4] === "") return 4;

  // Take a corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => gameState[i] === "");
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Take any empty cell
  const emptyCells = gameState.map((val, i) => (val === "" ? i : null)).filter(v => v !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// ✅ Reset only the board
function resetBoard() {
  gameActive = true;
  currentPlayer = "X";
  gameState = ["", "", "", "", "", "", "", "", ""];
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
  winningLine.style.display = "none";
  endModal.style.display = "none"; // hide modal if open
}

// ✅ Reset everything (board + scores)
function resetGame() {
  resetBoard();
  score = { X: 0, O: 0, Draw: 0 };
  scoreX.textContent = "0";
  scoreO.textContent = "0";
  scoreDraw.textContent = "0";
}

function updateScore(result) {
  if (result === "X") score.X++;
  else if (result === "O") score.O++;
  else if (result === "Draw") score.Draw++;

  scoreX.textContent = score.X;
  scoreO.textContent = score.O;
  scoreDraw.textContent = score.Draw;
}

function showEndModal(message) {
  endMessage.textContent = message;
  endModal.style.display = "flex";
}
