// Diwali Wonderland — all effects are digital screen animations.
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

$("#enterBtn").addEventListener("click", () => $("#celebrate").scrollIntoView({behavior:"smooth"}));
$("#backTop").addEventListener("click", () => $("#home").scrollIntoView({behavior:"smooth"}));
$$(".activity-card").forEach(card => card.addEventListener("click", () => {
  document.getElementById(card.dataset.target).scrollIntoView({behavior:"smooth"});
}));

// Gentle optional synthesized chime. Audio starts only after the visitor enables it.
let audioContext = null;
let soundOn = false;
function chime(frequency = 660) {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .35);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + .36);
  } catch (error) { console.info("Audio is unavailable in this browser."); }
}
$("#soundToggle").addEventListener("click", async () => {
  soundOn = !soundOn;
  $("#soundToggle").textContent = `♫ Sound: ${soundOn ? "On" : "Off"}`;
  $("#soundToggle").setAttribute("aria-pressed", String(soundOn));
  if (soundOn) { chime(523); }
});

// Virtual sparkle stage
let selectedEffect = "flower";
let sparklesMade = 0;
const effectNames = {flower:"Flower Pot",chakra:"Ground Chakra",sparkler:"Magic Sparkler",sky:"Sky Fireworks",confetti:"Festival Confetti"};
$$(".cracker-option").forEach(option => option.addEventListener("click", () => {
  $$(".cracker-option").forEach(item => item.classList.remove("active"));
  option.classList.add("active");
  selectedEffect = option.dataset.effect;
  $("#selectedEffectText").textContent = `Selected: ${effectNames[selectedEffect]}`;
  chime(590);
}));
const stage = $("#showStage");
function burstAt(x, y, effect = selectedEffect) {
  $("#stageHint").style.display = "none";
  const amount = effect === "flower" ? 58 : effect === "confetti" ? 75 : effect === "sparkler" ? 28 : 48;
  const palette = ["#f8d889","#f2a65a","#e87991","#b99af2","#fff0c4","#80d4c2"];
  for (let i = 0; i < amount; i++) {
    const dot = document.createElement("i");
    dot.className = `burst ${effect}`;
    const angle = Math.random() * Math.PI * 2;
    const distance = effect === "flower" ? 65 + Math.random()*125 : 45 + Math.random()*115;
    dot.style.setProperty("--x", `${x}px`); dot.style.setProperty("--y", `${y}px`);
    dot.style.setProperty("--dx", `${Math.cos(angle)*distance}px`);
    dot.style.setProperty("--dy", `${Math.sin(angle)*distance}px`);
    dot.style.setProperty("--c", palette[Math.floor(Math.random()*palette.length)]);
    if (effect === "flower") { dot.style.left = `${x + (Math.random()-.5)*55}px`; dot.style.top = `${y}px`; }
    stage.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove(), {once:true});
  }
  sparklesMade += amount;
  $("#showCount").textContent = `${sparklesMade} sparkles created`;
  chime(effect === "chakra" ? 740 : 660);
}
function stageBurstFromClick(event) {
  const rect = stage.getBoundingClientRect();
  burstAt(event.clientX - rect.left, event.clientY - rect.top);
}
stage.addEventListener("click", stageBurstFromClick);
$("#showBtn").addEventListener("click", () => burstAt(stage.clientWidth/2, stage.clientHeight*.55));
$("#clearStage").addEventListener("click", () => {
  $$(".burst", stage).forEach(dot => dot.remove());
  sparklesMade = 0; $("#showCount").textContent = "0 sparkles created";
  $("#stageHint").style.display = "block";
});

// Rangoli painter
let rangoliColor = "#e9ad4b";
$$(".swatch").forEach(swatch => swatch.addEventListener("click", () => {
  $$(".swatch").forEach(item => item.classList.remove("selected"));
  swatch.classList.add("selected"); rangoliColor = swatch.dataset.color;
}));
$$(".petal").forEach(petal => petal.addEventListener("click", () => {
  petal.style.background = rangoliColor;
  petal.style.boxShadow = `0 0 18px ${rangoliColor}`;
  chime(700);
}));
$("#resetRangoli").addEventListener("click", () => $$(".petal").forEach(petal => {
  petal.style.background = "#e9ad4b"; petal.style.boxShadow = "";
}));

// Wish envelopes and modal
$$(".envelope-card").forEach(card => card.addEventListener("click", () => {
  $("#modalMessage").textContent = card.dataset.wish;
  $("#wishModal").classList.add("open");
  $("#wishModal").setAttribute("aria-hidden","false");
  chime(784);
}));
function closeWish() {
  $("#wishModal").classList.remove("open");
  $("#wishModal").setAttribute("aria-hidden","true");
}
$("#closeModal").addEventListener("click", closeWish);
$("#modalOkay").addEventListener("click", closeWish);
$("#wishModal").addEventListener("click", event => { if (event.target === $("#wishModal")) closeWish(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeWish(); });

// Light the diyas game
$$(".diya-row button").forEach(diya => diya.addEventListener("click", () => {
  diya.classList.toggle("lit");
  const count = $$(".diya-row button.lit").length;
  $("#diyaStatus").textContent = count === 5 ? "All five diyas are glowing! ✨" : `${count} of 5 glowing`;
  chime(520 + count*65);
}));
$("#resetDiyas").addEventListener("click", () => {
  $$(".diya-row button").forEach(diya => diya.classList.remove("lit"));
  $("#diyaStatus").textContent = "0 of 5 glowing";
});

// Catch the sparkles game
let catchTimer = null, spawnTimer = null, catchScore = 0, gameRunning = false;
function endCatchGame() {
  gameRunning = false; clearInterval(catchTimer); clearInterval(spawnTimer);
  $$(".catch-star").forEach(star => star.remove());
  $("#catchStatus").textContent = `Round over! Final score: ${catchScore}`;
  $("#startCatch").textContent = "PLAY AGAIN";
}
function spawnCatchStar() {
  if (!gameRunning) return;
  const area = $("#catchArea");
  const star = document.createElement("button");
  star.type = "button"; star.className = "catch-star"; star.textContent = "✦";
  star.style.left = `${5 + Math.random()*83}%`;
  star.style.top = `${5 + Math.random()*65}%`;
  star.setAttribute("aria-label","Catch sparkle");
  star.addEventListener("click", () => {
    catchScore++; $("#catchStatus").textContent = `Score: ${catchScore}`;
    star.remove(); chime(820);
  }, {once:true});
  area.appendChild(star);
  setTimeout(() => star.remove(), 950);
}
$("#startCatch").addEventListener("click", () => {
  if (gameRunning) return;
  catchScore = 0; gameRunning = true;
  $("#catchStatus").textContent = "Score: 0 · 15 seconds";
  $("#catchArea").querySelector(".catch-instruction")?.remove();
  $("#startCatch").disabled = true;
  $("#startCatch").textContent = "GAME ON!";
  let seconds = 15;
  spawnCatchStar();
  spawnTimer = setInterval(spawnCatchStar, 650);
  catchTimer = setInterval(() => {
    seconds--;
    $("#catchStatus").textContent = `Score: ${catchScore} · ${seconds} seconds`;
    if (seconds <= 0) {
      endCatchGame(); $("#startCatch").disabled = false;
      $("#catchArea").innerHTML = '<span class="catch-instruction">Nice playing! Press play again.</span>';
    }
  }, 1000);
});

// Ambient floating stars on the page
const canvas = $("#sparkleCanvas");
const ctx = canvas.getContext("2d");
let width = 0, height = 0, stars = [];
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width*dpr; canvas.height = height*dpr;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length: Math.min(55, Math.floor(width/22))}, () => ({
    x:Math.random()*width,y:Math.random()*height,r:.4+Math.random()*1.4,
    a:.15+Math.random()*.45,s:.003+Math.random()*.009
  }));
}
function animateStars() {
  ctx.clearRect(0,0,width,height);
  for (const star of stars) {
    star.a += star.s;
    if (star.a > .75 || star.a < .12) star.s *= -1;
    ctx.beginPath(); ctx.arc(star.x,star.y,star.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(245,213,155,${star.a})`; ctx.fill();
  }
  requestAnimationFrame(animateStars);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); animateStars();
