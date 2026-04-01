/**
 * admin.js – Admin panel logic
 */

// NOTE: In a production app, authentication should be handled server-side.
// This client-side check is a convenience guard only.
const ADMIN_PASSWORD = 'admin1234';
const AUTH_KEY = 'lucky_admin_auth';

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function renderLoginForm() {
  document.getElementById('login-section').style.display  = 'block';
  document.getElementById('panel-section').style.display  = 'none';
}

function renderPanel() {
  document.getElementById('login-section').style.display  = 'none';
  document.getElementById('panel-section').style.display  = 'block';
  loadUsers();
}

function loadUsers() {
  const users = getUsers();
  const tbody = document.getElementById('users-tbody');
  const count = document.getElementById('user-count');

  count.textContent = users.length;
  tbody.innerHTML   = '';

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:#aaa;padding:1rem;">No registered users yet.</td></tr>';
    return;
  }

  users.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escHtml(u.name)}</td>
      <td>${formatPhone(u.phone)}</td>
      <td>${u.verified
        ? '<span class="badge badge-verified">✔ Verified</span>'
        : '<span class="badge badge-unverified">✘ Pending</span>'}</td>
      <td>₱${(u.balance || 0).toLocaleString()}</td>
      <td>${formatDate(u.registeredAt)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatPhone(p) {
  if (!p) return '—';
  const s = String(p);
  return s.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  if (isAuthed()) { renderPanel(); } else { renderLoginForm(); }

  // Login form
  const loginForm = document.getElementById('login-form');
  const loginMsg  = document.getElementById('login-msg');

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('admin-pass').value;
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      hideMsg(loginMsg);
      renderPanel();
    } else {
      showMsg(loginMsg, 'Incorrect password. Try again.', 'error');
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    renderLoginForm();
  });

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', loadUsers);
});
