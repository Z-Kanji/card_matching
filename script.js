/* ---------------- ABLY SETUP ---------------- */

const params = new URLSearchParams(window.location.search);
const ablyKey = params.get("ablyKey");
const mode = params.get("mode") || "master";

let ably = null;
let channel = null;

if (ablyKey) {
  ably = new Ably.Realtime(ablyKey);
  channel = ably.channels.get("card-game");
}

/* ---------------- GAME CODE ---------------- */

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

/* Sync helper */
function send(event, data){
  if(mode==="master" && channel){
    channel.publish(event, data);
  }
}

/* Receive updates (FOLLOW MODE) */
if(channel && mode==="follow"){
  channel.subscribe((msg)=>{
    const {name, data} = msg;

    if(name==="start") startSequence(false);
    if(name==="flip") forceFlip(data.index);
    if(name==="match") markMatch(data.a, data.b);
    if(name==="timer") timerDisplay.textContent = `Time: ${data}`;
    if(name==="end") endGame(data.win);
  });
}

/* Init */
function initBoard(){
  board.innerHTML="";
  const deck=[...images,...images];

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

    if(mode==="master"){
      card.addEventListener("click",()=>flipCard(card,i));
    }

    board.appendChild(card);
  });
}

/* Start */
function startSequence(sendEvent=true){
  if(gameOver) return;

  const cards=document.querySelectorAll(".card");
  cards.forEach(c=>c.classList.add("flipped"));

  if(sendEvent) send("start",{});

  setTimeout(()=>{
    cards.forEach(c=>c.classList.remove("flipped"));
  },3000);
}

/* Flip */
function flipCard(card,index){
  if(lockBoard||gameOver||card.classList.contains("flipped")) return;

  if(!timerStarted){
    startTimer();
    timerStarted=true;
  }

  card.classList.add("flipped");
  send("flip",{index});

  if(!firstCard){
    firstCard={card,index};
    return;
  }

  secondCard={card,index};
  lockBoard=true;

  const a=firstCard.card.querySelector("img").src;
  const b=secondCard.card.querySelector("img").src;

  if(a===b){
    firstCard.card.classList.add("matched");
    secondCard.card.classList.add("matched");

    send("match",{a:firstCard.index,b:secondCard.index});

    reset();
    checkWin();
  } else {
    setTimeout(()=>{
      firstCard.card.classList.remove("flipped");
      secondCard.card.classList.remove("flipped");
      reset();
    },800);
  }
}

/* FOLLOW FORCED ACTIONS */
function forceFlip(index){
  const card=document.querySelectorAll(".card")[index];
  card.classList.add("flipped");
}

function markMatch(a,b){
  const cards=document.querySelectorAll(".card");
  cards[a].classList.add("matched");
  cards[b].classList.add("matched");
}

/* Reset */
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
    send("timer",timeLeft);

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
  send("end",{win});
}

/* Controls */
if(mode==="master"){
  startBtn.addEventListener("click",()=>startSequence(true));
}

playAgainBtn.addEventListener("click",()=>location.reload());

initBoard();
