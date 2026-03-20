const params = new URLSearchParams(window.location.search);
const ablyKey = params.get("ablyKey");
const mode = params.get("mode") || "master";

let ably = ablyKey ? new Ably.Realtime(ablyKey) : null;
let channel = ably ? ably.channels.get("card-game") : null;

/* SEND EVENT */
function send(type, data = {}) {
  if (mode === "master" && channel) {
    channel.publish(type, data);
  }
}

/* RECEIVE EVENTS (FOLLOW) */
if (channel && mode === "follow") {
  channel.subscribe((msg) => {
    const { name, data } = msg;

    if (name === "start") startSequence(false);
    if (name === "shuffle") runShuffle(data.deck);
    if (name === "flip") flipFromSync(data.index);
    if (name === "unflip") unflipFromSync(data.a, data.b);
    if (name === "match") matchFromSync(data.a, data.b);
    if (name === "timer") updateTimer(data.time);
    if (name === "end") endGame(data.win);
  });
}

/* ---------------- ORIGINAL GAME ---------------- */

const images = [
  "ball.png","cards.png","goalie.jpg",
  "lavalle.jpg","lax_stick.png","wolfie.png"
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

/* INIT */
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

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

    if(mode==="master"){
      card.addEventListener("click",()=>flipCard(card,i));
    }

    board.appendChild(card);
  });
}

/* START */
function startSequence(sendEvent=true){
  if(gameOver) return;

  const cards=document.querySelectorAll(".card");
  cards.forEach(c=>c.classList.add("flipped"));

  if(sendEvent) send("start");

  setTimeout(()=>{
    const newDeck=shuffle([...images,...images]);

    runShuffle(newDeck);
    if(sendEvent) send("shuffle",{deck:newDeck});

  },3000);
}

/* SHUFFLE */
function runShuffle(deck){
  const cards=[...document.querySelectorAll(".card")];

  cards.forEach((card,i)=>{
    if(i<6) card.classList.add("to-left");
    else card.classList.add("to-right");
  });

  setTimeout(()=>{
    cards.forEach((card,i)=>{
      card.querySelector(".card-front img").src=deck[i];
      card.classList.remove("flipped","matched");
    });

    cards.forEach(card=>{
      card.classList.remove("to-left","to-right");
      card.classList.add("from-pile");
    });

    setTimeout(()=>{
      cards.forEach(c=>c.classList.remove("from-pile"));
    },600);

  },600);
}

/* FLIP */
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

      send("unflip",{a:firstCard.index,b:secondCard.index});
      reset();
    },800);
  }
}

/* FOLLOW HELPERS */
function flipFromSync(i){
  document.querySelectorAll(".card")[i].classList.add("flipped");
}

function unflipFromSync(a,b){
  const cards=document.querySelectorAll(".card");
  cards[a].classList.remove("flipped");
  cards[b].classList.remove("flipped");
}

function matchFromSync(a,b){
  const cards=document.querySelectorAll(".card");
  cards[a].classList.add("matched");
  cards[b].classList.add("matched");
}

/* TIMER */
function startTimer(){
  timerInterval=setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent=`Time: ${timeLeft}`;
    send("timer",{time:timeLeft});

    if(timeLeft<=0){
      clearInterval(timerInterval);
      endGame(false);
    }
  },1000);
}

function updateTimer(t){
  timerDisplay.textContent=`Time: ${t}`;
}

/* WIN */
function checkWin(){
  if(document.querySelectorAll(".matched").length===12){
    clearInterval(timerInterval);
    endGame(true);
  }
}

/* END */
function endGame(win){
  gameOver=true;
  overlay.classList.remove("hidden");
  overlayText.textContent=win?"YOU WIN!":"YOU LOSE!";
  send("end",{win});
}

/* EVENTS */
if(mode==="master"){
  startBtn.addEventListener("click",()=>startSequence(true));
}

playAgainBtn.addEventListener("click",()=>location.reload());

initBoard();
