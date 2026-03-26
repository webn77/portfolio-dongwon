/**
 * chat-widget.js — 이동원 포트폴리오 챗봇 위젯
 *
 * 삽입 방법:
 *   <script src="chat-widget.js"
 *           data-api="https://your-api.com"
 *           data-section-map='{"career":"#timeline","projects":"#cases",...}'>
 *   </script>
 */
(function () {
  'use strict';

  var script     = document.currentScript;
  var API_BASE   = (script && script.getAttribute('data-api')) || 'https://adaptation-stretch-premises-ready.trycloudflare.com';
  var sectionRaw = (script && script.getAttribute('data-section-map')) || '{}';
  var SECTION_MAP = {};
  try { SECTION_MAP = JSON.parse(sectionRaw); } catch (e) {}

  var SESSION_ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  /* ===== STYLES ===== */
  var STYLE = [
    '#cw-root *{box-sizing:border-box;margin:0;padding:0}',

    /* Greeting */
    '#cw-greeting{position:fixed;bottom:96px;right:28px;background:#fff;',
    'border-radius:20px 20px 6px 20px;box-shadow:0 8px 32px rgba(0,0,0,.14);',
    'padding:16px 18px;max-width:260px;z-index:9999;',
    'display:flex;align-items:flex-start;gap:10px;',
    'animation:cwPopIn .35s cubic-bezier(.34,1.56,.64,1) forwards}',
    '#cw-greeting.cw-hidden{display:none}',
    '#cw-greeting-body{flex:1}',
    "#cw-greeting-name{font-size:12px;font-weight:700;color:#6B7280;margin-bottom:5px;font-family:'Pretendard',sans-serif}",
    "#cw-greeting-text{font-size:14px;line-height:1.6;color:#111827;font-family:'Pretendard',sans-serif}",
    '#cw-greeting-close{background:none;border:none;cursor:pointer;color:#D1D5DB;',
    'font-size:14px;padding:0;line-height:1;flex-shrink:0;margin-top:1px;transition:color .15s}',
    '#cw-greeting-close:hover{color:#9CA3AF}',

    /* FAB */
    '#cw-fab{position:fixed;bottom:28px;right:28px;width:60px;height:60px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 6px 24px rgba(74,144,217,.55);z-index:9999;',
    'transition:transform .2s,box-shadow .2s}',
    '#cw-fab:hover{transform:scale(1.06);box-shadow:0 8px 30px rgba(74,144,217,.65)}',
    '#cw-fab svg{color:#fff;display:block}',

    /* Window */
    '#cw-window{position:fixed;bottom:104px;right:28px;width:420px;background:#F7F8FA;',
    'border-radius:24px;',
    'box-shadow:0 20px 60px rgba(0,0,0,.2),0 4px 16px rgba(0,0,0,.08);',
    'z-index:9998;display:flex;flex-direction:column;overflow:hidden;',
    "font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;",
    'transition:opacity .25s,transform .25s;transform-origin:bottom right}',
    '#cw-window.cw-hidden{opacity:0;transform:scale(.9) translateY(16px);pointer-events:none}',

    /* Header */
    '.cw-header{background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'padding:24px 22px 22px;flex-shrink:0}',
    '.cw-header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}',
    '.cw-header-brand{font-size:11px;font-weight:700;color:rgba(255,255,255,.65);',
    'letter-spacing:1px;text-transform:uppercase}',
    '.cw-close{background:rgba(255,255,255,.18);border:none;color:#fff;width:30px;height:30px;',
    'border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;',
    'justify-content:center;transition:background .2s;line-height:1}',
    '.cw-close:hover{background:rgba(255,255,255,.32)}',
    '.cw-header-profile{display:flex;align-items:center;gap:14px}',
    '.cw-avatar{width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.2);',
    'border:2.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;',
    'font-size:22px;font-weight:800;color:#fff;flex-shrink:0}',
    '.cw-name{font-size:18px;font-weight:700;color:#fff;margin-bottom:5px;letter-spacing:-.3px}',
    '.cw-status{display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,.82)}',
    '.cw-status-dot{width:8px;height:8px;border-radius:50%;background:#4ADE80;flex-shrink:0;',
    'box-shadow:0 0 6px rgba(74,222,128,.7)}',

    /* Chips */
    '.cw-suggestions{padding:14px 16px 12px;display:flex;gap:8px;flex-wrap:wrap;',
    'background:#fff;border-bottom:1px solid #EAEDF2;flex-shrink:0}',
    '.cw-chip{font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:20px;',
    'border:1.5px solid #C5CAE9;color:#5C6BC0;background:#F0F2FF;cursor:pointer;',
    "transition:all .15s;font-family:'Pretendard',sans-serif;white-space:nowrap}",
    '.cw-chip:hover{background:#5C6BC0;color:#fff;border-color:#5C6BC0}',

    /* Messages */
    '.cw-messages{flex:1;overflow-y:auto;padding:20px 18px;display:flex;',
    'flex-direction:column;gap:14px;max-height:420px;min-height:120px;background:#F7F8FA}',
    '.cw-messages::-webkit-scrollbar{width:4px}',
    '.cw-messages::-webkit-scrollbar-track{background:transparent}',
    '.cw-messages::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}',
    '.cw-msg-row{display:flex;flex-direction:column}',
    '.cw-msg-row.user{align-items:flex-end}',
    '.cw-msg-row.bot{align-items:flex-start}',
    '.cw-bot-row{display:flex;align-items:flex-end;gap:10px}',
    '.cw-bot-icon{width:34px;height:34px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'display:flex;align-items:center;justify-content:center;',
    'font-size:13px;font-weight:800;color:#fff;flex-shrink:0;margin-bottom:2px;',
    'box-shadow:0 2px 8px rgba(74,144,217,.3)}',
    '.cw-bubble{max-width:75%;padding:13px 16px;font-size:14px;line-height:1.65;word-break:break-word}',
    '.cw-msg-row.user .cw-bubble{',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'color:#fff;border-radius:20px 20px 5px 20px;',
    'box-shadow:0 3px 12px rgba(74,144,217,.3)}',
    '.cw-msg-row.bot .cw-bubble{background:#fff;color:#1F2937;',
    'border-radius:20px 20px 20px 5px;',
    'box-shadow:0 2px 8px rgba(0,0,0,.07);max-width:calc(75% + 44px)}',

    /* Anchor */
    '.cw-anchor-btn{margin-top:8px;margin-left:44px;display:inline-flex;align-items:center;gap:5px;',
    'font-size:12.5px;font-weight:700;color:#5C6BC0;border:1.5px solid #C5CAE9;',
    'background:#F0F2FF;padding:6px 14px;border-radius:20px;cursor:pointer;',
    "text-decoration:none;transition:all .15s;font-family:'Pretendard',sans-serif}",
    '.cw-anchor-btn:hover{background:#5C6BC0;color:#fff;border-color:#5C6BC0}',

    /* Loading */
    '.cw-loading{display:flex;align-items:center;gap:6px;padding:14px 16px;',
    'background:#fff;border-radius:20px 20px 20px 5px;',
    'box-shadow:0 2px 8px rgba(0,0,0,.07);width:fit-content}',
    '.cw-dot{width:7px;height:7px;border-radius:50%;background:#C0C7D4;',
    'animation:cwBounce 1.2s infinite ease-in-out}',
    '.cw-dot:nth-child(2){animation-delay:.2s}',
    '.cw-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes cwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}',

    /* Input */
    '.cw-input-row{display:flex;align-items:center;gap:10px;padding:14px 16px;',
    'background:#fff;border-top:1px solid #EAEDF2;flex-shrink:0}',
    "#cw-input{flex:1;border:1.5px solid #E5E7EB;border-radius:26px;padding:11px 18px;",
    "font-size:14px;font-family:'Pretendard',sans-serif;",
    'outline:none;color:#1F2937;background:#F9FAFB;transition:border-color .2s,box-shadow .2s}',
    '#cw-input::placeholder{color:#9CA3AF}',
    '#cw-input:focus{border-color:#7B5EA7;background:#fff;box-shadow:0 0 0 3px rgba(123,94,167,.1)}',
    '#cw-send{width:42px;height:42px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;transition:opacity .2s,transform .15s;',
    'box-shadow:0 3px 10px rgba(74,144,217,.4)}',
    '#cw-send:hover{opacity:.88;transform:scale(1.07)}',
    '#cw-send:disabled{opacity:.38;cursor:default;transform:none;box-shadow:none}',
    '#cw-send svg{color:#fff;display:block}',

    '@keyframes cwPopIn{from{opacity:0;transform:scale(.85) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
    '@media(max-width:480px){',
    '#cw-window{width:calc(100vw - 16px);right:8px;bottom:96px;border-radius:18px}',
    '#cw-greeting{right:8px;max-width:calc(100vw - 16px)}',
    '#cw-fab{right:16px;bottom:20px}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  /* ===== HTML ===== */
  var root = document.createElement('div');
  root.id = 'cw-root';
  root.innerHTML = [
    '<div id="cw-greeting">',
    '  <div id="cw-greeting-body">',
    '    <div id="cw-greeting-name">이동원 AI 어시스턴트</div>',
    '    <div id="cw-greeting-text">👋 안녕하세요!<br>포트폴리오에 대해 궁금한 것을 물어보세요.</div>',
    '  </div>',
    '  <button id="cw-greeting-close" aria-label="닫기">&#x2715;</button>',
    '</div>',
    '<button id="cw-fab" aria-label="채팅 열기">',
    '  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"',
    '       stroke="currentColor" stroke-width="2"',
    '       stroke-linecap="round" stroke-linejoin="round">',
    '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    '  </svg>',
    '</button>',
    '<div id="cw-window" class="cw-hidden" role="dialog" aria-label="이동원 챗봇">',
    '  <div class="cw-header">',
    '    <div class="cw-header-top">',
    '      <span class="cw-header-brand">Portfolio Assistant</span>',
    '      <button class="cw-close" aria-label="닫기">&#x2715;</button>',
    '    </div>',
    '    <div class="cw-header-profile">',
    '      <div class="cw-avatar">이</div>',
    '      <div>',
    '        <div class="cw-name">이동원</div>',
    '        <div class="cw-status"><span class="cw-status-dot"></span>지금 바로 답변 가능해요</div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="cw-suggestions">',
    '    <button class="cw-chip">결제 경력이 얼마나 돼요?</button>',
    '    <button class="cw-chip">가장 큰 성과는?</button>',
    '    <button class="cw-chip">팀 리드 경험 있나요?</button>',
    '  </div>',
    '  <div id="cw-messages" class="cw-messages"></div>',
    '  <div class="cw-input-row">',
    '    <input id="cw-input" type="text" placeholder="메시지를 입력하세요..." autocomplete="off" />',
    '    <button id="cw-send" aria-label="전송">',
    '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"',
    '           stroke="currentColor" stroke-width="2.5"',
    '           stroke-linecap="round" stroke-linejoin="round">',
    '        <line x1="22" y1="2" x2="11" y2="13"/>',
    '        <polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    '      </svg>',
    '    </button>',
    '  </div>',
    '</div>'
  ].join('\n');
  document.body.appendChild(root);

  /* ===== LOGIC ===== */
  var fab = document.getElementById('cw-fab');
  var win = document.getElementById('cw-window');
  var closeBtn = win.querySelector('.cw-close');
  var messagesEl = document.getElementById('cw-messages');
  var inputEl = document.getElementById('cw-input');
  var sendBtn = document.getElementById('cw-send');
  var chips = win.querySelectorAll('.cw-chip');
  var greeting = document.getElementById('cw-greeting');
  var greetClose = document.getElementById('cw-greeting-close');

  var isOpen = false, isBusy = false;

  function hideGreeting() { greeting.classList.add('cw-hidden'); }
  greetClose.addEventListener('click', function (e) { e.stopPropagation(); hideGreeting(); });
  setTimeout(hideGreeting, 8000);

  function toggleWindow() {
    isOpen = !isOpen;
    win.classList.toggle('cw-hidden', !isOpen);
    if (isOpen) { hideGreeting(); inputEl.focus(); }
  }
  fab.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { inputEl.value = chip.textContent.trim(); sendMessage(); });
  });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function appendUserMsg(text) {
    var row = document.createElement('div');
    row.className = 'cw-msg-row user';
    var b = document.createElement('div');
    b.className = 'cw-bubble';
    b.textContent = text;
    row.appendChild(b);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function makeBotRow() {
    var row = document.createElement('div');
    row.className = 'cw-msg-row bot';
    var br = document.createElement('div');
    br.className = 'cw-bot-row';
    var icon = document.createElement('div');
    icon.className = 'cw-bot-icon';
    icon.textContent = '이';
    var b = document.createElement('div');
    b.className = 'cw-bubble';
    br.appendChild(icon);
    br.appendChild(b);
    row.appendChild(br);
    messagesEl.appendChild(row);
    scrollBottom();
    return { row: row, bubble: b };
  }

  function showLoading() {
    var row = document.createElement('div');
    row.className = 'cw-msg-row bot';
    row.id = 'cw-loading-row';
    var br = document.createElement('div');
    br.className = 'cw-bot-row';
    var icon = document.createElement('div');
    icon.className = 'cw-bot-icon';
    icon.textContent = '이';
    var dots = document.createElement('div');
    dots.className = 'cw-loading';
    dots.innerHTML = '<div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>';
    br.appendChild(icon);
    br.appendChild(dots);
    row.appendChild(br);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function hideLoading() {
    var el = document.getElementById('cw-loading-row');
    if (el) el.remove();
  }

  function appendAnchorBtn(row, href, label) {
    var btn = document.createElement('a');
    btn.className = 'cw-anchor-btn';
    btn.href = href;
    btn.textContent = label || '자세히 보기';
    btn.addEventListener('click', function (e) {
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
    row.appendChild(btn);
  }

  function typeText(bubble, text, onDone) {
    var i = 0, speed = Math.max(10, Math.min(25, Math.floor(1200 / text.length)));
    bubble.textContent = '';
    (function tick() {
      if (i < text.length) { bubble.textContent += text[i++]; scrollBottom(); setTimeout(tick, speed); }
      else if (onDone) onDone();
    })();
  }

  function sendMessage() {
    var query = inputEl.value.trim();
    if (!query || isBusy) return;
    isBusy = true; sendBtn.disabled = true; inputEl.value = '';
    appendUserMsg(query); showLoading();
    fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, session_id: SESSION_ID, sections: SECTION_MAP })
    })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      hideLoading();
      var ref = makeBotRow();
      typeText(ref.bubble, (data.text || '').trim() || '답변을 가져오지 못했어요.', function () {
        if (data.anchor) appendAnchorBtn(ref.row, data.anchor, data.anchor_label || '자세히 보기');
        isBusy = false; sendBtn.disabled = false;
      });
    })
    .catch(function () {
      hideLoading();
      var ref = makeBotRow();
      ref.bubble.textContent = '죄송해요, 잠시 후 다시 시도해 주세요.';
      isBusy = false; sendBtn.disabled = false;
    });
  }
})();
