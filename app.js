// --- SHARED STATE (Session Storage for Progress Tracking Only) ---
function getState() {
  const saved = sessionStorage.getItem('internlytic_portal_state');
  if (saved) return JSON.parse(saved);
  return {
    modules: [false, false, false],
    quizDone: false,
    bestScore: null,
    checklist: Array(9).fill(false)
  };
}

function saveState(state) {
  sessionStorage.setItem('internlytic_portal_state', JSON.stringify(state));
  updateGlobalBanner();
}

function updateGlobalBanner() {
  const state = getState();
  const modDone = state.modules.filter(Boolean).length;
  const checkDone = state.checklist.filter(Boolean).length === 9 ? 1 : 0;
  const quizDone = state.quizDone ? 1 : 0;

  const totalMilestones = 5; // 3 learning modules + 1 quiz + 1 full checklist
  const completed = modDone + quizDone + checkDone;
  const pct = Math.round((completed / totalMilestones) * 100);

  const bar = document.getElementById('globalBar');
  const txt = document.getElementById('globalText');
  if (bar && txt) {
    bar.style.width = pct + '%';
    txt.innerText = `${pct}% Completed (${completed}/${totalMilestones} Milestones)`;
  }
}

// --- PAGE 1: LEARNING MODULES ---
function initModulesPage() {
  const state = getState();
  state.modules.forEach((isDone, idx) => {
    const btn = document.getElementById(`btn-mod-${idx}`);
    const card = document.getElementById(`mod-card-${idx}`);
    if (btn && card) {
      if (isDone) {
        btn.innerText = '✓ Completed';
        btn.className = 'btn btn-success';
        card.style.borderColor = 'var(--success)';
      } else {
        btn.innerText = 'Mark Module Completed';
        btn.className = 'btn btn-primary';
        card.style.borderColor = 'var(--border)';
      }
    }
  });
}

function toggleModule(idx) {
  const state = getState();
  state.modules[idx] = !state.modules[idx];
  saveState(state);
  initModulesPage();
}

// --- PAGE 2: 10-QUESTION QUIZ ---
const questions = [
  {
    cat: "Email Phishing",
    text: "From: support@paypa1-resolution-center.com\nSubject: URGENT: Unauthorized login from Russia!\nBody: Click http://paypa1-resolution-center.com/verify to confirm your card details within 15 minutes.",
    safe: false,
    exp: "UNSAFE: Uses typosquatting ('paypa1' with number 1), extreme panic tactics, and unencrypted HTTP."
  },
  {
    cat: "Internal IT Notice",
    text: "From: it-security@internlytic-example.org\nSubject: Reminder: Enable MFA Before Friday\nBody: Please open your official company Okta dashboard from your browser bookmarks to enroll your authenticator app. No links are included in this email.",
    safe: true,
    exp: "SAFE: Contains no embedded links and instructs users to navigate via their own trusted bookmarks."
  },
  {
    cat: "SMS Smishing",
    text: "SMS (+1-844-555-0120): 'USPS: Your package #9482 is held at warehouse due to incomplete address. Update here: https://usps-redelivery-fee.top'",
    safe: false,
    exp: "UNSAFE: Fake delivery SMS using a suspicious .top domain designed to steal credit card details."
  },
  {
    cat: "GitHub Security Alert",
    text: "From: noreply@github.com\nSubject: [GitHub] A third-party OAuth application was added to your account\nBody: If you did not authorize this app, visit https://github.com/settings/applications to review and revoke access.",
    safe: true,
    exp: "SAFE: Legitimate domain (github.com) directing you to official account settings without requesting passwords."
  },
  {
    cat: "Malicious Attachment",
    text: "From: payroll-admin@hr-benefits-update.net\nAttachment: Salary_Revision_2026.zip (contains .scr executable)\nBody: Open the attached archive to view your revised compensation letter.",
    safe: false,
    exp: "UNSAFE: Zipped executable/screensaver (.scr) files sent over email are a classic malware/ransomware delivery method."
  },
  {
    cat: "Slack / Teams Impersonation",
    text: "Direct Message from 'CEO_Mark_R (External)':\n'Hey, are you at your desk? I am in a confidential board meeting and need you to buy 4 Apple Gift Cards urgently. I will reimburse you today.'",
    safe: false,
    exp: "UNSAFE (Business Email/Chat Compromise): Executives never ask employees to urgently purchase gift cards over DMs."
  },
  {
    cat: "Banking Alert",
    text: "SMS from Official Bank Shortcode:\n'Alert: A login attempt to your account was blocked. If this wasn't you, call the number printed on the back of your debit card immediately.'",
    safe: true,
    exp: "SAFE: Provides no clickable phishing link and tells you to verify using the trusted number on your physical card."
  },
  {
    cat: "Fake Browser Update",
    text: "Website Pop-up Banner:\n'Your Chrome Browser is critically outdated! Click Download_Chrome_Patch.exe now to continue viewing this page.'",
    safe: false,
    exp: "UNSAFE: Browsers update automatically through built-in settings—never via random website .exe downloads."
  },
  {
    cat: "OAuth Consent Phishing",
    text: "Login Prompt:\nAn unknown third-party app 'FreePDFConverter123' asks for full permission to 'Read, send, and delete all your Gmail messages permanently.'",
    safe: false,
    exp: "UNSAFE: Excessive OAuth permissions allow attackers to hijack your inbox without ever needing your password."
  },
  {
    cat: "Password Reset Confirmation",
    text: "From: security@accounts.google.com\nSubject: Security alert: Password changed\nBody: Your password was recently changed. If you made this change, you don't need to do anything.",
    safe: true,
    exp: "SAFE: Standard informational alert from the authentic google.com domain."
  }
];

let qIdx = 0;
let currentScore = 0;
let userHistory = [];

function initQuizPage() {
  const state = getState();
  const bestEl = document.getElementById('bestScoreDisplay');
  if (bestEl && state.bestScore !== null) {
    bestEl.innerText = `${state.bestScore} / ${questions.length}`;
  }
  if (document.getElementById('qText')) {
    renderQuestion();
  }
}

function renderQuestion() {
  const q = questions[qIdx];
  document.getElementById('qProgress').innerText = `Question ${qIdx + 1} of ${questions.length}`;
  document.getElementById('qScore').innerText = `${currentScore} Points`;
  document.getElementById('qCategory').innerText = q.cat;
  document.getElementById('qText').innerText = q.text;

  document.getElementById('qButtons').style.display = 'flex';
  document.getElementById('qFeedback').style.display = 'none';
  document.getElementById('qNextBtn').style.display = 'none';
}

function answerQuiz(choseSafe) {
  const q = questions[qIdx];
  const correct = (choseSafe === q.safe);
  if (correct) currentScore++;

  userHistory.push({ cat: q.cat, correct, exp: q.exp });

  const fb = document.getElementById('qFeedback');
  fb.style.display = 'block';
  fb.className = correct ? 'alert alert-success' : 'alert alert-danger';
  fb.innerHTML = `<strong>${correct ? '✓ Correct!' : '✗ Incorrect!'}</strong> ${q.exp}`;

  document.getElementById('qScore').innerText = `${currentScore} Points`;
  document.getElementById('qButtons').style.display = 'none';

  const nextBtn = document.getElementById('qNextBtn');
  nextBtn.style.display = 'inline-block';
  nextBtn.innerText = qIdx < questions.length - 1 ? 'Next Scenario →' : 'View Final Scoreboard';
}

function nextQuizQuestion() {
  qIdx++;
  if (qIdx < questions.length) {
    renderQuestion();
  } else {
    const state = getState();
    state.quizDone = true;
    if (state.bestScore === null || currentScore > state.bestScore) {
      state.bestScore = currentScore;
    }
    saveState(state);

    const pct = Math.round((currentScore / questions.length) * 100);
    const reviewHtml = userHistory.map((item, i) => `
      <div class="example-box ${item.correct ? 'example-good' : 'example-bad'}">
        <strong>Q${i + 1} (${item.cat}) — ${item.correct ? 'Passed ✓' : 'Missed ✗'}</strong>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">${item.exp}</p>
      </div>
    `).join('');

    document.getElementById('quizArea').innerHTML = `
      <h2 style="color:var(--primary);">Final Quiz Scoreboard: ${currentScore} / ${questions.length} (${pct}%)</h2>
      <p style="color:var(--text-muted); margin:8px 0 18px;">
        ${pct >= 80 ? 'Outstanding! You are well-prepared to spot social engineering and phishing attacks.' : 'Keep practicing! Review the breakdown below and try again to aim for 80%+.'}
      </p>
      <div style="margin-bottom:20px;">${reviewHtml}</div>
      <button class="btn btn-primary" onclick="location.reload()">Retake Quiz</button>
      <a href="link-inspector.html" class="btn btn-success" style="margin-left:10px;">Next: Link Inspector &rarr;</a>
    `;
  }
}

// --- PAGE 3: LINK INSPECTOR ---
function fillUrl(val) {
  document.getElementById('urlField').value = val;
  runUrlInspection();
}

function runUrlInspection() {
  const input = document.getElementById('urlField').value.trim();
  const out = document.getElementById('urlOutput');
  if (!input) return;

  const warnings = [];
  const lower = input.toLowerCase();

  if (lower.startsWith('http://')) warnings.push('Unencrypted HTTP protocol detected (traffic is not encrypted with TLS/SSL).');
  if (lower.includes('@')) warnings.push('Deceptive "@" character found: browsers ignore text before "@" and navigate to the domain after it.');
  if (/https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(lower)) warnings.push('Raw IP address used instead of a registered organization domain.');
  if (/(paypa1|micros0ft|amaz0n|g00gle|app1e|verify|login-secure|update-kyc)/i.test(lower)) warnings.push('Matches common typosquatting or credential-harvesting keywords.');
  if (/\.(xyz|tk|ml|ga|cf|gq|top)(\/|$)/i.test(lower)) warnings.push('High-risk top-level domain (.xyz, .tk, .top) frequently used in disposable phishing sites.');

  try {
    const parsed = new URL(lower.startsWith('http') ? lower : 'https://' + lower);
    if (parsed.hostname.split('.').length > 3) {
      warnings.push(`Excessive subdomains (${parsed.hostname}) used to mask the true root domain.`);
    }
  } catch (e) {
    warnings.push('Invalid or malformed URL syntax.');
  }

  out.style.display = 'block';
  if (warnings.length > 0) {
    out.className = 'alert alert-danger';
    out.innerHTML = `<strong>⚠ High Risk — ${warnings.length} Phishing Indicator(s) Found:</strong><ul style="margin-top:8px; padding-left:20px;">${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;
  } else {
    out.className = 'alert alert-success';
    out.innerHTML = `<strong>✓ Clean Structural Check:</strong> Uses HTTPS and standard domain formatting. Always confirm the exact spelling of the root domain before logging in.`;
  }
}

// --- PAGE 4: PASSWORD STRENGTH METER ---
function checkPasswordStrength() {
  const pwd = document.getElementById('pwdInput').value;
  const hasLen = pwd.length >= 12;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNum = /[0-9]/.test(pwd);
  const hasSym = /[^A-Za-z0-9]/.test(pwd);
  const noSeq = !/(1234|password|qwerty|admin)/i.test(pwd);

  setBox('chk-len', hasLen, 'Minimum 12 Characters');
  setBox('chk-upper', hasUpper, 'Uppercase Letters (A–Z)');
  setBox('chk-lower', hasLower, 'Lowercase Letters (a–z)');
  setBox('chk-num', hasNum, 'Numbers (0–9)');
  setBox('chk-sym', hasSym, 'Special Symbols (!@#$...)');
  setBox('chk-seq', noSeq && pwd.length > 0, 'No Common Patterns (123 / password)');

  // Calculate approximate entropy bits
  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasNum) pool += 10;
  if (hasSym) pool += 32;
  const entropy = pwd.length > 0 ? Math.round(pwd.length * Math.log2(pool || 1)) : 0;
  document.getElementById('pwdEntropy').innerText = `Entropy: ${entropy} bits`;

  const bar = document.getElementById('pwdBar');
  const rating = document.getElementById('pwdRating');

  if (!pwd.length) {
    bar.style.width = '0%';
    rating.innerText = 'Rating: Waiting for input...';
    rating.style.color = 'var(--text)';
  } else if (entropy < 45 || !noSeq) {
    bar.style.width = '30%';
    bar.style.background = 'var(--danger)';
    rating.innerText = 'Rating: Weak (Vulnerable to fast offline cracking)';
    rating.style.color = 'var(--danger)';
  } else if (entropy < 70) {
    bar.style.width = '68%';
    bar.style.background = 'var(--warning)';
    rating.innerText = 'Rating: Moderate (Increase length to 14+ characters)';
    rating.style.color = 'var(--warning)';
  } else {
    bar.style.width = '100%';
    bar.style.background = 'var(--success)';
    rating.innerText = 'Rating: Strong (Resistant to brute-force attacks)';
    rating.style.color = 'var(--success)';
  }
}

function setBox(id, ok, label) {
  const el = document.getElementById(id);
  el.innerText = (ok ? '✓ ' : '✗ ') + label;
  el.style.borderLeftColor = ok ? 'var(--success)' : 'var(--border)';
  el.style.color = ok ? 'var(--success)' : 'var(--text-muted)';
}

function togglePwd() {
  const inp = document.getElementById('pwdInput');
  const btn = document.getElementById('pwdToggle');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerText = inp.type === 'password' ? 'Show' : 'Hide';
}

function generateDemoPassphrase() {
  const words = ['Cyber', 'Falcon', 'Shield', 'Quantum', 'Cedar', 'Orbit', 'Matrix', 'Vertex'];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const demo = `${w1}-${w2}#${num}!Safe`;
  const inp = document.getElementById('pwdInput');
  inp.type = 'text';
  document.getElementById('pwdToggle').innerText = 'Hide';
  inp.value = demo;
  checkPasswordStrength();
}

// --- PAGE 5: SECURE CODING CHECKLIST ---
function initChecklistPage() {
  const boxes = document.querySelectorAll('.dev-chk');
  if (!boxes.length) return;
  const state = getState();
  boxes.forEach(box => {
    const id = parseInt(box.dataset.id, 10);
    box.checked = state.checklist[id];
  });
  updateChecklistBadge();
}

function saveChecklist() {
  const boxes = document.querySelectorAll('.dev-chk');
  const state = getState();
  boxes.forEach(box => {
    const id = parseInt(box.dataset.id, 10);
    state.checklist[id] = box.checked;
  });
  saveState(state);
  updateChecklistBadge();
}

function updateChecklistBadge() {
  const state = getState();
  const count = state.checklist.filter(Boolean).length;
  const badge = document.getElementById('checkCounter');
  if (badge) badge.innerText = `${count} / 9 Completed`;
}

// --- INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  updateGlobalBanner();
  initModulesPage();
  initQuizPage();
  initChecklistPage();
});