const imageFiles = [
  "ball.png",
  "cards.png",
  "goalie.jpg",
  "lavalle.jpg",
  "lax stick.png",
  "wolfie.png"
];

const logoFile = "wolfhead 2016.png";

const board = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const timerDisplay = document.getElementById("timer");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerStarted = false;
let timerInterval = null;
let timeLeft = 60;
let shuffledCards = [];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildBoard() {
  board.innerHTML = "";
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  timerStarted = false;
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";

  shuffledCards = shuffle([...imageFiles, ...imageFiles]);

  shuffledCards.forEach((imageName) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.image = imageName;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <img src="${logoFile}" alt="Logo">
        </div>
        <div class="card-face card-back">
          <img src="${imageName}" alt="Card image">
        </div>
      </div>
    `;

    card.addEventListener("click", handleCardClick);
    board.appendChild(card);
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timerDisplay.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      alert("Time's up!");
    }
  }, 1000);
}

function handleCardClick() {
  if (lockBoard) return;
  if (this.classList.contains("matched")) return;
  if (this === firstCard) return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  const isMatch = firstCard.dataset.image === secondCard.dataset.image;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    const matchedCards = document.querySelectorAll(".card.matched");
    if (matchedCards.length === 12) {
      clearInterval(timerInterval);
      alert("You win!");
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }, 750);
  }
}

startBtn.addEventListener("click", buildBoard);
