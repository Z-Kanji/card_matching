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
const timerDisplay = document.getElementById("timer");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerStarted = false;
let timeLeft = 60;
let timerInterval = null;

/* Shuffle */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* Initialize board (LOGO SIDE SHOWING) */
function initBoard() {
  board.innerHTML = "";
  const deck = shuffle([...images, ...images]);

  deck.forEach((img, i) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${img}">
          <div class="card-number">${i+1}</div>
        </div>
        <div class="card-back">
          <img src="${logo}">
          <div class="card-number">${i+1}</div>
        </div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

/* Start sequence */
function startSequence() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(c => c.classList.add("flipped"));

  setTimeout(() => {
    const newDeck = shuffle([...images, ...images]);

    cards.forEach((card, i) => {
      card.querySelector(".card-front img").src = newDeck[i];
      card.classList.remove("flipped");
      card.classList.remove("matched");
    });

    resetGameState();
  }, 3000);
}

/* Reset */
function resetGameState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timerStarted = false;
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";
}

/* Flip logic */
function flipCard() {
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

/* Timer */
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

/* Win check */
function checkWin() {
  if (document.querySelectorAll(".matched").length === 12) {
    clearInterval(timerInterval);
    endGame(true);
  }
}

/* End game */
function endGame(win) {
  overlay.classList.remove("hidden");
  overlayText.textContent = win ? "YOU WIN!" : "YOU LOSE!";

  if (win) launchConfetti();
}

/* Better confetti */
function launchConfetti() {
  const colors = ["#ff0","#f00","#0f0","#0ff","#f0f"];
  for (let i = 0; i < 120; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random()*100 + "vw";
    conf.style.background = colors[Math.floor(Math.random()*colors.length)];
    conf.style.animationDuration = (Math.random()*3 + 2) + "s";
    document.body.appendChild(conf);

    setTimeout(()=>conf.remove(),5000);
  }
}

/* Init */
initBoard();
startBtn.addEventListener("click", startSequence);
