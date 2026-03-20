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
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const timerDisplay = document.getElementById("timer");

let firstCard=null, secondCard=null;
let lockBoard=false, timerStarted=false;
let timerInterval, timeLeft=60, gameOver=false;

/* Shuffle */
function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

/* Init */
function initBoard(){
  board.innerHTML="";
  const deck=shuffle([...images,...images]);

  deck.forEach((img,i)=>{
    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
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

    card.addEventListener("click",flipCard);
    board.appendChild(card);
  });
}

/* TRUE 2-PILE SHUFFLE */
function shuffleAnimation(callback){
  const cards=[...document.querySelectorAll(".card")];

  cards.forEach((card,i)=>{
    card.classList.remove("to-left","to-right","from-pile");

    if(i<6){
      card.classList.add("to-left");  // first 6 cards → left pile
    } else {
      card.classList.add("to-right"); // last 6 → right pile
    }
  });

  setTimeout(()=>{
    callback();

    cards.forEach(card=>{
      card.classList.remove("to-left","to-right");
      card.classList.add("from-pile");
    });

    setTimeout(()=>{
      cards.forEach(c=>c.classList.remove("from-pile"));
    },600);

  },600);
}

/* Start */
function startSequence(){
  if(gameOver) return;

  const cards=document.querySelectorAll(".card");
  cards.forEach(c=>c.classList.add("flipped"));

  setTimeout(()=>{
    shuffleAnimation(()=>{
      const newDeck=shuffle([...images,...images]);
      cards.forEach((card,i)=>{
        card.querySelector(".card-front img").src=newDeck[i];
        card.classList.remove("flipped","matched");
      });
    });
  },3000);
}

/* Flip */
function flipCard(){
  if(lockBoard||gameOver||this.classList.contains("flipped")) return;

  if(!timerStarted){
    startTimer();
    timerStarted=true;
  }

  this.classList.add("flipped");

  if(!firstCard){
    firstCard=this;
    return;
  }

  secondCard=this;
  lockBoard=true;

  const a=firstCard.querySelector("img").src;
  const b=secondCard.querySelector("img").src;

  if(a===b){
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    reset();
    checkWin();
  } else {
    setTimeout(()=>{
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      reset();
    },800);
  }
}

function reset(){
  firstCard=null;
  secondCard=null;
  lockBoard=false;
}

/* Timer */
function startTimer(){
  timerInterval=setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent=`Time: ${timeLeft}`;

    if(timeLeft<=0){
      clearInterval(timerInterval);
      endGame(false);
    }
  },1000);
}

/* Win */
function checkWin(){
  if(document.querySelectorAll(".matched").length===12){
    clearInterval(timerInterval);
    endGame(true);
  }
}

/* End */
function endGame(win){
  gameOver=true;
  overlay.classList.remove("hidden");
  overlayText.textContent=win?"YOU WIN!":"YOU LOSE!";
  if(win) confetti();
}

/* FIXED CONFETTI */
function confetti(){
  const colors=["#ff4d4d","#ffd24d","#4dff88","#4dd2ff","#c84dff"];

  for(let i=0;i<220;i++){
    const c=document.createElement("div");
    c.className="confetti";
    c.style.left=Math.random()*100+"vw";
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDuration=(5+Math.random()*4)+"s";
    document.body.appendChild(c);

    setTimeout(()=>c.remove(),9000);
  }
}

/* Play Again FIX */
playAgainBtn.addEventListener("click",()=>{
  location.reload();
});

/* Init */
initBoard();
startBtn.addEventListener("click",startSequence);
