const images = [
  "ball.png",
  "cards.png",
  "goalie.jpg",
  "lavalle.jpg",
  "lax stick.png",
  "wolfie.png"
];

const logo = "wolfhead 2016.png";

let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let timerStarted = false;
let time = 60;
let timerInterval;

const board = document.getElementById("gameBoard");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");

/* CREATE CARDS */
function setupGame() {
  board.innerHTML = "";
  timerDisplay.textContent = "Time: 60";

  timerStarted = false;
  clearInterval(timerInterval);

  cards = [...images, ...images].sort(() => Math.random() - 0.5);

  cards.forEach((img) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = img;

    card.innerHTML = `
      <img src="${logo}" class="back">
      <img src="${img}" class="front">
    `;

    card.addEventListener("click", handleClick);
    board.appendChild(card);
  });
}

/* HANDLE CLICK */
function handleClick() {
  if (lock) return;
  if (this.classList.contains("flipped")) return;

  // Start timer ONLY on first click
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
  checkMatch();
}

/* MATCH LOGIC */
function checkMatch() {
  const match = firstCard.dataset.image === secondCard.dataset.image;

  if (match) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    resetTurn();
    checkWin();
  } else {
    lock = true;
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
  lock = false;
}

/* TIMER */
function startTimer() {
  time = 60;
  timerInterval = setInterval(() => {
    time--;
    timerDisplay.textContent = "Time: " + time;

    if (time <= 0) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

/* WIN CHECK */
function checkWin() {
  const matched = document.querySelectorAll(".matched");
  if (matched.length === cards.length) {
    clearInterval(timerInterval);
    alert("You win!");
  }
}

/* START BUTTON */
startBtn.addEventListener("click", setupGame);
