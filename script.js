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
let lockBoard = false;
let timeLeft = 60;
let timerInterval;
let timerStarted = false;

function createCards() {
  const board = document.getElementById("gameBoard");
  board.innerHTML = "";

  cards = [...images, ...images].sort(() => 0.5 - Math.random());

  cards.forEach((img) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = img;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back">
          <img src="${logo}" alt="logo">
        </div>
        <div class="card-front">
          <img src="${img}" alt="card">
        </div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  this.classList.add("flip");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.image === secondCard.dataset.image;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    resetTurn();
    checkWin();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetTurn();
    }, 700);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function startTimer() {
  timeLeft = 60;
  document.getElementById("timer").textContent = "Time: " + timeLeft;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "Time: " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

function checkWin() {
  const matched = document.querySelectorAll(".matched");
  if (matched.length === cards.length) {
    clearInterval(timerInterval);
    alert("You win!");
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  timerStarted = false;
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "Time: 60";

  createCards();

  // Show all cards briefly
  const allCards = document.querySelectorAll(".card");
  allCards.forEach(card => card.classList.add("flip"));

  setTimeout(() => {
    allCards.forEach(card => card.classList.remove("flip"));
  }, 2000);
});
