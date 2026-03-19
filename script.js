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
let timerInterval = null;
let timeLeft = 60;

// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function buildBoard() {
  board.innerHTML = "";
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  clearInterval(timerInterval);
  timerStarted = false;
  timeLeft = 60;
  timerDisplay.textContent = "Time: 60";

  const cardList = shuffle([...images, ...images]);

  cardList.forEach((img, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${img}" alt="card">
          <div class="card-number">${index+1}</div>
        </div>
        <div class="card-back">
          <img src="${logo}" alt="logo">
          <div class="card-number">${index+1}</div>
        </div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });

  // Show all cards for 3 seconds
  document.querySelectorAll(".card").forEach(c => c.classList.add("flipped"));
  setTimeout(() => {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("flipped"));
  }, 3000);
}

// Flip logic
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

  const firstImg = firstCard.querySelector(".card-front img").src;
  const secondImg = secondCard.querySelector(".card-front img").src;

  if (firstImg === secondImg) {
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
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showOverlay(false);
    }
  }, 1000);
}

function checkWin() {
  const matched = document.querySelectorAll(".card.matched");
  if (matched.length === 12) {
    clearInterval(timerInterval);
    showOverlay(true);
  }
}

function showOverlay(win) {
  overlay.classList.remove("hidden");
  overlayText.textContent = win ? "YOU WIN!" : "YOU LOSE!";
  if (win) {
    // simple confetti effect
    confettiEffect();
  }
}

// Basic confetti
function confettiEffect() {
  const colors = ["#ff0", "#f00", "#0f0", "#0ff", "#f0f"];
  const interval = setInterval(()=>{
    const conf = document.createElement("div");
    conf.style.position = "fixed";
    conf.style.width = "8px";
    conf.style.height = "8px";
    conf.style.background = colors[Math.floor(Math.random()*colors.length)];
    conf.style.left = Math.random()*window.innerWidth + "px";
    conf.style.top = "0px";
    conf.style.zIndex = 200;
    document.body.appendChild(conf);
    let top = 0;
    const fall = setInterval(()=>{
      top += 5;
      conf.style.top = top + "px";
      if(top>window.innerHeight){conf.remove(); clearInterval(fall);}
    },20);
  },50);
}

startBtn.addEventListener("click", buildBoard);
