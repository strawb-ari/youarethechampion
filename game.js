/**
 * game.js – Lucky Color game logic
 */

const COLORS = [
  { id: 'red',    label: 'Red',    cls: 'color-red'    },
  { id: 'blue',   label: 'Blue',   cls: 'color-blue'   },
  { id: 'green',  label: 'Green',  cls: 'color-green'  },
  { id: 'yellow', label: 'Yellow', cls: 'color-yellow' },
  { id: 'purple', label: 'Purple', cls: 'color-purple' },
  { id: 'white',  label: 'White',  cls: 'color-white'  },
];

let currentUser   = null;
let selectedColor = null;
let spinning      = false;

/* ─── Init ─── */
function initGame() {
  renderColorGrid();
  loadUser();
  document.getElementById('spin-btn').addEventListener('click', spin);
}

/* ─── User ─── */
function loadUser() {
  const uid = sessionStorage.getItem('lucky_user_id');
  const users = getUsers();

  if (uid) {
    currentUser = users.find(u => String(u.id) === String(uid)) || null;
  }

  if (!currentUser) {
    // Try to use any verified user (demo convenience)
    currentUser = users.find(u => u.verified) || null;
  }

  if (currentUser) {
    document.getElementById('player-name').textContent    = currentUser.name;
    document.getElementById('player-balance').textContent = '₱' + currentUser.balance.toLocaleString();
  } else {
    document.getElementById('player-name').textContent    = 'Guest';
    document.getElementById('player-balance').textContent = '₱0';
  }
}

function updateBalance(newBal) {
  if (!currentUser) return;
  currentUser.balance = newBal;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) { users[idx].balance = newBal; saveUsers(users); }
  document.getElementById('player-balance').textContent = '₱' + newBal.toLocaleString();
}

/* ─── Color Grid ─── */
function renderColorGrid() {
  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';
  COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = `color-btn ${c.cls}`;
    btn.dataset.id = c.id;
    btn.textContent = c.label;
    btn.type = 'button';
    btn.addEventListener('click', () => selectColor(c.id, btn));
    grid.appendChild(btn);
  });
}

function selectColor(id, btn) {
  if (spinning) return;
  selectedColor = id;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  hideResult();
}

/* ─── Spin ─── */
function spin() {
  if (spinning) return;

  const resultBox = document.getElementById('result-box');
  hideResult();

  if (!selectedColor) {
    showMsg(document.getElementById('game-msg'), 'Please pick a color first!', 'error');
    return;
  }

  const betVal = parseInt(document.getElementById('bet-amount').value, 10);
  if (!betVal || betVal < 10) {
    showMsg(document.getElementById('game-msg'), 'Minimum bet is ₱10.', 'error');
    return;
  }
  if (currentUser && betVal > currentUser.balance) {
    showMsg(document.getElementById('game-msg'), 'Insufficient balance.', 'error');
    return;
  }

  hideMsg(document.getElementById('game-msg'));
  spinning = true;
  document.getElementById('spin-btn').disabled = true;

  // Animated "flicker" pick
  const flickerInterval = setInterval(() => {
    const rand = COLORS[Math.floor(Math.random() * COLORS.length)];
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.color-btn[data-id="${rand.id}"]`).classList.add('selected');
  }, 100);

  setTimeout(() => {
    clearInterval(flickerInterval);

    // Restore player's chosen color highlight
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.color-btn[data-id="${selectedColor}"]`).classList.add('selected');

    // Pick winning color
    const winner = COLORS[Math.floor(Math.random() * COLORS.length)];
    const won = winner.id === selectedColor;

    // Show result
    resultBox.classList.add('show', won ? 'win' : 'lose');
    resultBox.innerHTML = won
      ? `🎉 <strong>${winner.label}</strong> won! You picked <strong>${winner.label}</strong>. +₱${betVal.toLocaleString()}`
      : `😞 <strong>${winner.label}</strong> won. You picked <strong>${COLORS.find(c => c.id === selectedColor).label}</strong>. -₱${betVal.toLocaleString()}`;

    // Update balance
    if (currentUser) {
      const newBal = won ? currentUser.balance + betVal : currentUser.balance - betVal;
      updateBalance(Math.max(0, newBal));
    }

    spinning = false;
    document.getElementById('spin-btn').disabled = false;
  }, 2000);
}

function hideResult() {
  const r = document.getElementById('result-box');
  r.className = 'result-box';
  r.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', initGame);
