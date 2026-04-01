/**
 * app.js – Shared application logic
 * Handles: dollar-rain canvas, user storage (localStorage), registration, OTP verification
 */

/* ─── Dollar-Rain Animation ─── */
(function initRain() {
  const canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let drops = [];
  const SYMBOL = '$';

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    createDrops();
  }

  function createDrops() {
    drops = [];
    const cols = Math.floor(canvas.width / 22);
    for (let i = 0; i < cols; i++) {
      drops.push({
        x: i * 22 + Math.random() * 10,
        y: Math.random() * canvas.height,
        speed: 1.5 + Math.random() * 3,
        size: 12 + Math.random() * 10,
        opacity: 0.4 + Math.random() * 0.6,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(d => {
      ctx.font = `bold ${d.size}px monospace`;
      ctx.fillStyle = `rgba(255, 215, 0, ${d.opacity})`;
      ctx.fillText(SYMBOL, d.x, d.y);
      d.y += d.speed;
      if (d.y > canvas.height + 20) {
        d.y = -20;
        d.speed = 1.5 + Math.random() * 3;
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ─── Storage helpers ─── */
const STORAGE_KEY = 'lucky_color_users';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function findUserByPhone(phone) {
  return getUsers().find(u => u.phone === normalizePhone(phone));
}

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '');
}

/* ─── OTP helpers ─── */
const OTP_SESSION_KEY = 'lucky_otp';

function generateOTP() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Produce a 6-digit code (100000–999999)
  return String(100000 + (array[0] % 900000));
}

function saveOTP(phone, code) {
  const data = { phone: normalizePhone(phone), code, expires: Date.now() + 10 * 60 * 1000 };
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(data));
}

function verifyOTP(phone, code) {
  try {
    const data = JSON.parse(sessionStorage.getItem(OTP_SESSION_KEY));
    if (!data) return false;
    if (data.phone !== normalizePhone(phone)) return false;
    if (Date.now() > data.expires) return false;
    return data.code === String(code).trim();
  } catch { return false; }
}

function clearOTP() {
  sessionStorage.removeItem(OTP_SESSION_KEY);
}

/* ─── Message helper ─── */
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `msg show ${type}`;
}

function hideMsg(el) {
  if (!el) return;
  el.className = 'msg';
}
