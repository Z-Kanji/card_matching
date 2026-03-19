const images = [
  "ball.png",
  "cards.png",
  "goalie.jpg",
  "lavalle.jpg",
  "lax_stick.png",
  "wolfie.png"
];

const logo = "wolfhead.png";

const board = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const timerDisplay = document.getElementById("timer");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerStarted = false;
let timerInterval = null;
let timeLeft = 60;
let gameOver = false;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function resetGameState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timerStarted = false;
  gameOver = false;
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";
  hideOverlay();
}

function hideOverlay() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
}

function showOverlay(win) {
  overlayText.textContent = win ? "YOU WIN!" : "YOU LOSE!";
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");

  if (win) {
    launchConfetti();
  }
}

function initBoard() {
  board.innerHTML = "";
  const deck = shuffle([...images, ...images]);

  deck.forEach((img, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${img}" alt="Card image">
          <div class="card-number">${i + 1}</div>
        </div>
        <div class="card-back">
          <img src="${logo}" alt="Logo">
          <div class="card-number">${i + 1}</div>
        </div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

function startSequence() {
  if (gameOver) return;

  const cards = document.querySelectorAll(".card");
  cards.forEach(card => card.classList.add("flipped"));

  setTimeout(() => {
    const newDeck = shuffle([...images, ...images]);

    cards.forEach((card, index) => {
      card.querySelector(".card-front img").src = newDeck[index];
      card.classList.remove("flipped");
      card.classList.remove("matched");
    });

    resetGameState();
  }, 3000);
}

function flipCard() {
  if (gameOver) return;
  if (lockBoard) return;
  if (this.classList.contains("flipped") || this.classList.contains("matched")) return;

  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  const img1 = firstCard.querySelector(".card-front img").src;
  const img2 = secondCard.querySelector(".card-front img").src;

  if (img1 === img2) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    resetTurn();
    checkWin();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }

    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function checkWin() {
  if (document.querySelectorAll(".card.matched").length === 12) {
    clearInterval(timerInterval);
    endGame(true);
  }
}

function endGame(win) {
  gameOver = true;
  lockBoard = true;
  showOverlay(win);
}

function launchConfetti() {
  const colors = ["#ff4d4d", "#ffd24d", "#4dff88", "#4dd2ff", "#c84dff"];
  const pieces = 140;

  for (let i = 0; i < pieces; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (2.8 + Math.random() * 2.2) + "s";
    confetti.style.transform = `translateY(0) rotate(${Math.random() * 180}deg)`;
    confetti.style.width = (5 + Math.random() * 5) + "px";
    confetti.style.height = (8 + Math.random() * 10) + "px";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 6000);
  }
}

startBtn.addEventListener("click", startSequence);
playAgainBtn.addEventListener("click", () => {
  location.reload();
});

initBoard();
resetGameState();
