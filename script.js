/* --- simple digital escape room logic --- */

const startBtn = document.getElementById('startBtn');
const room = document.getElementById('room');
const intro = document.getElementById('intro');
const success = document.getElementById('success');
const timerEl = document.getElementById('timer');
const hintBtn = document.getElementById('hintBtn');
const hintsLeftEl = document.getElementById('hintsLeft');

let timeLeft = 10 * 60; // seconds (10:00)
let timerInterval = null;
let hintsLeft = 3;
let solved = {1:false,2:false,3:false};

function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = (s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

function startTimer(){
  timerEl.textContent = 'Time: ' + formatTime(timeLeft);
  timerInterval = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = 'Time: ' + formatTime(timeLeft);
    if(timeLeft<=0){
      clearInterval(timerInterval);
      failAll();
    }
  },1000);
}

function failAll(){
  alert("Time's up! The memory fades. Refresh or press 'Play again' to try again.");
  // lock everything
  document.querySelectorAll('.btn').forEach(b=>b.disabled=true);
}

startBtn.addEventListener('click', ()=>{
  intro.classList.add('hidden');
  room.classList.remove('hidden');
  startTimer();
});

/* ---------- HINT SYSTEM ---------- */
hintBtn.addEventListener('click', ()=>{
  if(hintsLeft<=0) return alert("No hints left.");
  if(timeLeft <= 30) return alert("Too little time to use a hint.");
  hintsLeft--;
  hintsLeftEl.textContent = hintsLeft;
  timeLeft -= 30; // hint costs 30 seconds
  if(!solved[1]){
    alert("Hint 1: Think of a year connected to their 'big promise' — it's older than 1970.");
  } else if(!solved[2]){
    alert("Hint 2: Caesar shift by 23 (or shift left by 3).");
  } else if(!solved[3]){
    alert("Hint 3: Rearrange the letters to spell a common word tied to the house.");
  } else {
    alert("You're almost done — try the door.");
  }
});

/* ---------- PUZZLE 1: Numeric Lock ---------- */
/* We'll use code 1956 (example). You can change it to match your thematic choices. */
const p1Input = document.getElementById('p1-input');
const p1Submit = document.getElementById('p1-submit');
const p1Feedback = document.getElementById('p1-feedback');

p1Submit.addEventListener('click', ()=>{
  const val = p1Input.value.trim();
  if(val === '1956'){
    p1Feedback.textContent = 'The lock clicks — a secret compartment opens.';
    markSolved(1);
  } else {
    p1Feedback.textContent = 'That year is not right. Try again.';
  }
});

/* ---------- PUZZLE 2: Caesar Cipher ---------- */
/* Cipher text is: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG" shifted by +3 => QEB ... (that's a demo)
   We'll accept the decrypted phrase in lowercase without punctuation.
*/
const p2Input = document.getElementById('p2-input');
const p2Submit = document.getElementById('p2-submit');
const p2Feedback = document.getElementById('p2-feedback');

p2Submit.addEventListener('click', ()=>{
  const guess = p2Input.value.trim().toLowerCase().replace(/[^a-z ]/g,'');
  const correct = 'the quick brown fox jumps over the lazy dog';
  if(guess === correct){
    p2Feedback.textContent = 'Nice work — the message resolves into something familiar.';
    markSolved(2);
  } else {
    p2Feedback.textContent = "That doesn't match the decrypted sentence. Try shifting letters left by 3.";
  }
});

/* ---------- PUZZLE 3: Word Wheel ---------- */
/* Letters: G L A S S -> solution: glass */
const p3Input = document.getElementById('p3-input');
const p3Submit = document.getElementById('p3-submit');
const p3Feedback = document.getElementById('p3-feedback');

p3Submit.addEventListener('click', ()=>{
  const guess = p3Input.value.trim().toLowerCase();
  if(guess === 'glass'){
    p3Feedback.textContent = 'The final bolt releases. You push the door open.';
    markSolved(3);
    finishEscape();
  } else {
    p3Feedback.textContent = 'Not quite. Try another arrangement of the letters.';
  }
});

/* letter buttons fill the input for fun */
document.querySelectorAll('.letter').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    p3Input.value += btn.textContent;
  });
});

/* ---------- Utility: mark step solved & unlock next ---------- */
function markSolved(n){
  solved[n] = true;
  // mark progress UI
  const stepEl = document.querySelector(`.step[data-step="${n}"]`);
  if(stepEl) stepEl.classList.add('done');

  // unlock next puzzle
  if(n === 1){
    document.getElementById('p2').classList.remove('locked');
    document.getElementById('p2-feedback').textContent = 'You found a clue: rotate letters left by 3.';
  }
  if(n === 2){
    document.getElementById('p3').classList.remove('locked');
  }
}

/* ---------- Finish ---------- */
function finishEscape(){
  clearInterval(timerInterval);
  room.classList.add('hidden');
  success.classList.remove('hidden');
}

/* ---------- Restart ---------- */
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', ()=>{
  location.reload();
});

/* optional: keyboard shortcuts for testing */
document.addEventListener('keydown', (e)=>{
  if(e.key === '1') { p1Input.value='1956'; p1Submit.click(); }
  if(e.key === '2') { p2Input.value='the quick brown fox jumps over the lazy dog'; p2Submit.click(); }
  if(e.key === '3') { p3Input.value='glass'; p3Submit.click(); }
});
