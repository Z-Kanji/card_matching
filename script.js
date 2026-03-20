const params = new URLSearchParams(window.location.search);
const ablyKey = params.get("ablyKey");
const mode = params.get("mode") || "master";

let ably = ablyKey ? new Ably.Realtime(ablyKey) : null;
let channel = ably ? ably.channels.get("card-game") : null;

/* ---------------- GAME STATE ---------------- */
let state = {
  deck: [],
  flipped: [],
  matched: [],
  time: 60,
  started: false,
  gameOver: false
};

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

/* ---------------- SYNC ---------------- */
function broadcast(){
  if(mode==="master" && channel){
    channel.publish("state", state);
  }
}

if(channel && mode==="follow"){
  channel.subscribe("state", msg=>{
    state = msg.data;
    renderState();
  });
}

/* ---------------- INIT ---------------- */
function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

function initBoard(){
  board.innerHTML="";
  state.deck = shuffle([...images, ...images]);

  state.deck.forEach((img,i)=>{
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
      card.addEventListener("click",()=>handleFlip(i));
    }

    board.appendChild(card);
  });

  renderState();
}

/* ---------------- RENDER ---------------- */
function renderState(){
  const cards = document.querySelectorAll(".card");

  cards.forEach((card,i)=>{
    card.classList.toggle("flipped", state.flipped.includes(i));
    card.classList.toggle("matched", state.matched.includes(i));
  });

  timerDisplay.textContent = `Time: ${state.time}`;

  if(state.gameOver){
    overlay.classList.remove("hidden");
    overlayText.textContent = state.win ? "YOU WIN!" : "YOU LOSE!";
  }
}

/* ---------------- START ---------------- */
function startSequence(){
  if(mode!=="master") return;

  const cards = document.querySelectorAll(".card");

  cards.forEach((c,i)=>{
    state.flipped.push(i);
  });

  broadcast();
  renderState();

  setTimeout(()=>{
    state.flipped = [];
    state.matched = [];
    state.deck = shuffle([...images,...images]);
    state.started = true;
    state.time = 60;

    updateCardImages();
    broadcast();
    renderState();
  },3000);
}

/* Update images after shuffle */
function updateCardImages(){
  const cards = document.querySelectorAll(".card");
  cards.forEach((card,i)=>{
    card.querySelector(".card-front img").src = state.deck[i];
  });
}

/* ---------------- GAMEPLAY ---------------- */
let first=null;

function handleFlip(index){
  if(state.gameOver) return;
  if(state.flipped.includes(index)) return;

  if(!state.started){
    startTimer();
    state.started=true;
  }

  state.flipped.push(index);

  if(first===null){
    first=index;
  } else {
    const second=index;

    if(state.deck[first] === state.deck[second]){
      state.matched.push(first, second);
      first=null;
    } else {
      setTimeout(()=>{
        state.flipped = state.flipped.filter(i=>i!==first && i!==second);
        first=null;
        broadcast();
        renderState();
      },800);
    }
  }

  broadcast();
  renderState();
  checkWin();
}

/* ---------------- TIMER ---------------- */
function startTimer(){
  const interval = setInterval(()=>{
    if(state.gameOver){
      clearInterval(interval);
      return;
    }

    state.time--;
    broadcast();
    renderState();

    if(state.time<=0){
      endGame(false);
      clearInterval(interval);
    }
  },1000);
}

/* ---------------- WIN ---------------- */
function checkWin(){
  if(state.matched.length===12){
    endGame(true);
  }
}

function endGame(win){
  state.gameOver=true;
  state.win=win;
  broadcast();
  renderState();
}

/* ---------------- EVENTS ---------------- */
if(mode==="master"){
  startBtn.addEventListener("click",startSequence);
}

playAgainBtn.addEventListener("click",()=>location.reload());

initBoard();
