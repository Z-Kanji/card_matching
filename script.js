const params = new URLSearchParams(window.location.search);
const ablyKey = params.get("ablyKey");
const mode = params.get("mode") || "master";

let ably = ablyKey ? new Ably.Realtime(ablyKey) : null;
let channel = ably ? ably.channels.get("card-game") : null;

/* SEND */
function send(type,data={}){
  if(mode==="master" && channel){
    channel.publish(type,data);
  }
}

/* RECEIVE */
if(channel && mode==="follow"){
  channel.subscribe(msg=>{
    const {name,data}=msg;

    if(name==="start") startSequence(false);
    if(name==="setDeck") setDeck(data.deck);
    if(name==="flip") flipSync(data.i);
    if(name==="unflip") unflipSync(data.a,data.b);
    if(name==="match") matchSync(data.a,data.b);
    if(name==="timer") updateTimer(data.t);
    if(name==="end") endGame(data.win);
  });
}

/* GAME */

const images=[
  "ball.png","cards.png","goalie.jpg",
  "lavalle.jpg","lax_stick.png","wolfie.png"
];

const logo="wolfhead.png";

const board=document.getElementById("gameBoard");
const startBtn=document.getElementById("startBtn");
const playAgainBtn=document.getElementById("playAgainBtn");
const overlay=document.getElementById("overlay");
const overlayText=document.getElementById("overlayText");
const timerDisplay=document.getElementById("timer");

let deck=[];
let firstCard=null,secondCard=null;
let lockBoard=false,timerStarted=false;
let timerInterval,timeLeft=60,gameOver=false;

/* INIT */
function initBoard(){
  board.innerHTML="";
  deck=[...images,...images];

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

/* SHUFFLE (MASTER ONLY GENERATES) */
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

function startSequence(sendEvent=true){
  if(gameOver) return;

  const cards=document.querySelectorAll(".card");
  cards.forEach(c=>c.classList.add("flipped"));

  if(sendEvent) send("start");

  setTimeout(()=>{
    const newDeck=shuffle([...images,...images]);

    setDeck(newDeck);
    if(sendEvent) send("setDeck",{deck:newDeck});

  },3000);
}

function setDeck(newDeck){
  deck=newDeck;

  const cards=[...document.querySelectorAll(".card")];

  /* shuffle animation */
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
function flipCard(card,i){
  if(lockBoard||gameOver||card.classList.contains("flipped")) return;

  if(!timerStarted){
    startTimer();
    timerStarted=true;
  }

  card.classList.add("flipped");
  send("flip",{i});

  if(!firstCard){
    firstCard={card,i};
    return;
  }

  secondCard={card,i};
  lockBoard=true;

  if(deck[firstCard.i]===deck[secondCard.i]){
    firstCard.card.classList.add("matched");
    secondCard.card.classList.add("matched");

    send("match",{a:firstCard.i,b:secondCard.i});
    reset();
    checkWin();

  } else {
    setTimeout(()=>{
      firstCard.card.classList.remove("flipped");
      secondCard.card.classList.remove("flipped");

      send("unflip",{a:firstCard.i,b:secondCard.i});
      reset();
    },800);
  }
}

/* FOLLOW ACTIONS */
function flipSync(i){
  document.querySelectorAll(".card")[i].classList.add("flipped");
}

function unflipSync(a,b){
  const cards=document.querySelectorAll(".card");
  cards[a].classList.remove("flipped");
  cards[b].classList.remove("flipped");
}

function matchSync(a,b){
  const cards=document.querySelectorAll(".card");
  cards[a].classList.add("matched");
  cards[b].classList.add("matched");
}

function reset(){
  firstCard=null;
  secondCard=null;
  lockBoard=false;
}

/* TIMER */
function startTimer(){
  timerInterval=setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent=`Time: ${timeLeft}`;
    send("timer",{t:timeLeft});

    if(timeLeft<=0){
      clearInterval(timerInterval);
      endGame(false);
    }
  },1000);
}

function updateTimer(t){
  timeLeft=t;
  timerDisplay.textContent=`Time: ${t}`;
}

/* WIN */
function checkWin(){
  if(document.querySelectorAll(".matched").length===12){
    clearInterval(timerInterval);
    endGame(true);
  }
}

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
