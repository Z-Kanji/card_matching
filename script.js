const images = [
  "ball.png",
  "cards.png",
  "goalie.jpg",
  "lavalle.jpg",
  "lax_stick.png",
  "wolfie.png"
];

const logo = "wolfhead_2016.png";

const board = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const timerDisplay = document.getElementById("timer");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerStarted = false;
let timerInterval = null;
let timeLeft = 60;

/* Shuffle array */
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/* Build the 12 cards */
function buildBoard() {
  board.innerHTML = "";
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timerStarted = false;
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";

  const shuffled = shuffle([...images, ...images]);

  shuffled.forEach((img) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${img}" alt="card image">
        </div>
        <div class="card-back">
          <img src="${logo}" alt="logo">
        </div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

/* Flip card logic */
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

  if (firstCard.querySelector(".card-front img").src === secondCard.querySelector(".card-front img").src) {
    // Matched
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

/* Timer logic */
function startTimer() {
  clearInterval(timerInterval);
  timerDisplay.textContent = "Time: 60";
  timeLeft = 60;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      alert("Time's up!");
    }
  }, 1000);
}

function checkWin() {
  const matched = document.querySelectorAll(".card.matched");
  if (matched.length === 12) {
    clearInterval(timerInterval);
    alert("You win!");
  }
}

/* Start button event */
startBtn.addEventListener("click", buildBoard);
