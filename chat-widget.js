/**
 * chat-widget.js — 이동원 포트폴리오 챗봇 위젯
 *
 * 삽입 방법:
 *   <script src="chat-widget.js"
 *           data-api="https://your-api.com"
 *           data-section-map='{"career":"#timeline","projects":"#cases",...}'>
 *   </script>
 *
 * 응답 형식: { text: string, anchor?: string, anchor_label?: string }
 */
(function () {
  'use strict';

  var script      = document.currentScript;
  var API_BASE    = (script && script.getAttribute('data-api')) || 'https://adaptation-stretch-premises-ready.trycloudflare.com';
  var sectionRaw  = (script && script.getAttribute('data-section-map')) || '{}';
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
    '#cw-greeting{position:fixed;bottom:90px;right:20px;background:#fff;',
    'border-radius:18px 18px 4px 18px;',
    'box-shadow:0 4px 24px rgba(0,0,0,.13);',
    'padding:13px 16px;max-width:230px;z-index:9999;',
    'display:flex;align-items:flex-start;gap:8px;',
    'animation:cwPopIn .3s cubic-bezier(.34,1.56,.64,1) forwards}',
    '#cw-greeting.cw-hidden{display:none}',
    "#cw-greeting-text{font-size:13px;line-height:1.55;color:#1a2744;font-family:'Pretendard',sans-serif;flex:1}",
    '#cw-greeting-close{background:none;border:none;cursor:pointer;color:#C0C7D4;',
    'font-size:12px;padding:0;line-height:1;flex-shrink:0;margin-top:2px;transition:color .15s}',
    '#cw-greeting-close:hover{color:#9CA3AF}',

    /* FAB */
    '#cw-fab{position:fixed;bottom:20px;right:20px;width:54px;height:54px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 4px 16px rgba(74,144,217,.5);z-index:9999;',
    'transition:transform .2s,box-shadow .2s}',
    '#cw-fab:hover{transform:scale(1.07);box-shadow:0 6px 22px rgba(74,144,217,.6)}',
    '#cw-fab svg{color:#fff;display:block}',

    /* Window */
    '#cw-window{position:fixed;bottom:86px;right:20px;width:360px;background:#F4F6FB;',
    'border-radius:20px;',
    'box-shadow:0 16px 48px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08);',
    'z-index:9998;display:flex;flex-direction:column;overflow:hidden;',
    "font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;",
    'transition:opacity .22s,transform .22s;transform-origin:bottom right}',
    '#cw-window.cw-hidden{opacity:0;transform:scale(.92) translateY(12px);pointer-events:none}',

    /* Header */
    '.cw-header{background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'padding:18px 18px 16px;flex-shrink:0}',
    '.cw-header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}',
    '.cw-header-brand{font-size:11px;font-weight:700;color:rgba(255,255,255,.75);',
    'letter-spacing:.5px;text-transform:uppercase}',
    '.cw-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;',
    'border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;',
    'justify-content:center;transition:background .2s;line-height:1}',
    '.cw-close:hover{background:rgba(255,255,255,.35)}',
    '.cw-header-profile{display:flex;align-items:center;gap:12px}',
    '.cw-avatar{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.22);',
    'border:2px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;',
    'font-size:18px;font-weight:800;color:#fff;flex-shrink:0}',
    '.cw-profile-info{flex:1}',
    '.cw-name{font-size:16px;font-weight:700;color:#fff;margin-bottom:3px}',
    '.cw-status{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.8)}',
    '.cw-status-dot{width:7px;height:7px;border-radius:50%;background:#4ADE80;flex-shrink:0}',

    /* Chips */
    '.cw-suggestions{padding:12px 14px 10px;display:flex;gap:6px;flex-wrap:wrap;',
    'background:#fff;border-bottom:1px solid #EAECF2;flex-shrink:0}',
    '.cw-chip{font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:20px;',
    'border:1.5px solid #C5CAE9;color:#5C6BC0;background:#F0F2FF;cursor:pointer;',
    "transition:background .15s,color .15s,border-color .15s;font-family:'Pretendard',sans-serif;white-space:nowrap}",
    '.cw-chip:hover{background:#5C6BC0;color:#fff;border-color:#5C6BC0}',

    /* Messages */
    '.cw-messages{flex:1;overflow-y:auto;padding:16px 14px;display:flex;',
    'flex-direction:column;gap:10px;max-height:380px;min-height:100px;background:#F4F6FB}',
    '.cw-messages::-webkit-scrollbar{width:4px}',
    '.cw-messages::-webkit-scrollbar-track{background:transparent}',
    '.cw-messages::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}',
    '.cw-msg-row{display:flex;flex-direction:column}',
    '.cw-msg-row.user{align-items:flex-end}',
    '.cw-msg-row.bot{align-items:flex-start}',
    '.cw-bot-row{display:flex;align-items:flex-end;gap:8px}',
    '.cw-bot-icon{width:28px;height:28px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'display:flex;align-items:center;justify-content:center;',
    'font-size:12px;font-weight:800;color:#fff;flex-shrink:0;margin-bottom:2px}',
    '.cw-bubble{max-width:78%;padding:10px 14px;font-size:13.5px;line-height:1.6;word-break:break-word}',
    '.cw-msg-row.user .cw-bubble{',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'color:#fff;border-radius:18px 18px 4px 18px;',
    'box-shadow:0 2px 8px rgba(74,144,217,.25)}',
    '.cw-msg-row.bot .cw-bubble{background:#fff;color:#1F2937;',
    'border-radius:18px 18px 18px 4px;',
    'box-shadow:0 1px 4px rgba(0,0,0,.08);max-width:calc(78% + 36px)}',

    /* Anchor */
    '.cw-anchor-btn{margin-top:7px;display:inline-flex;align-items:center;gap:4px;',
    'font-size:11.5px;font-weight:700;color:#5C6BC0;border:1.5px solid #C5CAE9;',
    'background:#F0F2FF;padding:5px 12px;border-radius:20px;cursor:pointer;',
    "text-decoration:none;transition:background .15s,color .15s,border-color .15s;",
    "font-family:'Pretendard',sans-serif;margin-left:36px}",
    '.cw-anchor-btn:hover{background:#5C6BC0;color:#fff;border-color:#5C6BC0}',

    /* Loading */
    '.cw-loading{display:flex;align-items:center;gap:5px;padding:11px 14px;',
    'background:#fff;border-radius:18px 18px 18px 4px;',
    'box-shadow:0 1px 4px rgba(0,0,0,.08);width:fit-content}',
    '.cw-dot{width:6px;height:6px;border-radius:50%;background:#B0BAD4;',
    'animation:cwBounce 1.2s infinite ease-in-out}',
    '.cw-dot:nth-child(2){animation-delay:.2s}',
    '.cw-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes cwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',

    /* Input */
    '.cw-input-row{display:flex;align-items:center;gap:8px;padding:12px 14px;',
    'background:#fff;border-top:1px solid #EAECF2;flex-shrink:0}',
    "#cw-input{flex:1;border:1.5px solid #E5E7EB;border-radius:24px;padding:9px 16px;",
    "font-size:13.5px;font-family:'Pretendard',sans-serif;",
    'outline:none;color:#1F2937;background:#F9FAFB;transition:border-color .2s,box-shadow .2s}',
    '#cw-input::placeholder{color:#9CA3AF}',
    '#cw-input:focus{border-color:#7B5EA7;background:#fff;box-shadow:0 0 0 3px rgba(123,94,167,.1)}',
    '#cw-send{width:38px;height:38px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;transition:opacity .2s,transform .15s;',
    'box-shadow:0 2px 8px rgba(74,144,217,.35)}',
    '#cw-send:hover{opacity:.88;transform:scale(1.07)}',
    '#cw-send:disabled{opacity:.4;cursor:default;transform:none;box-shadow:none}',
    '#cw-send svg{color:#fff;display:block}',

    '@keyframes cwPopIn{from{opacity:0;transform:scale(.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}',
    '@media(max-width:440px){#cw-window{width:calc(100vw - 16px);right:8px;bottom:84px}#cw-greeting{right:8px}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  /* ===== HTML ===== */
  var root = document.createElement('div');
  root.id = 'cw-root';
  root.innerHTML = [
    '<div id="cw-greeting">',
    '  <span id="cw-greeting-text">👋 안녕하세요!<br>이동원 포트폴리오 챗봇입니다.<br>궁금한 것을 물어보세요!</span>',
    '  <button id="cw-greeting-close" aria-label="닫기">&#x2715;</button>',
    '</div>',
    '<button id="cw-fab" aria-label="채팅 열기">',
    '  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"',
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
    '      <div class="cw-profile-info">',
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
    '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"',
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
  var fab        = document.getElementById('cw-fab');
  var win        = document.getElementById('cw-window');
  var closeBtn   = win.querySelector('.cw-close');
  var messagesEl = document.getElementById('cw-messages');
  var inputEl    = document.getElementById('cw-input');
  var sendBtn    = document.getElementById('cw-send');
  var chips      = win.querySelectorAll('.cw-chip');
  var greeting   = document.getElementById('cw-greeting');
  var greetClose = document.getElementById('cw-greeting-close');

  var isOpen = false;
  var isBusy = false;

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
    chip.addEventListener('click', function () {
      inputEl.value = chip.textContent.trim();
      sendMessage();
    });
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function appendUserMsg(text) {
    var row = document.createElement('div');
    row.className = 'cw-msg-row user';
    var bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function showLoading() {
    var row = document.createElement('div');
    row.className = 'cw-msg-row bot';
    row.id = 'cw-loading-row';
    var botRow = document.createElement('div');
    botRow.className = 'cw-bot-row';
    var icon = document.createElement('div');
    icon.className = 'cw-bot-icon';
    icon.textContent = '이';
    var dots = document.createElement('div');
    dots.className = 'cw-loading';
    dots.innerHTML = '<div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>';
    botRow.appendChild(icon);
    botRow.appendChild(dots);
    row.appendChild(botRow);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function hideLoading() {
    var el = document.getElementById('cw-loading-row');
    if (el) el.remove();
  }

  function createBotRow() {
    var row = document.createElement('div');
    row.className = 'cw-msg-row bot';
    var botRow = document.createElement('div');
    botRow.className = 'cw-bot-row';
    var icon = document.createElement('div');
    icon.className = 'cw-bot-icon';
    icon.textContent = '이';
    var bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    botRow.appendChild(icon);
    botRow.appendChild(bubble);
    row.appendChild(botRow);
    messagesEl.appendChild(row);
    scrollBottom();
    return { row: row, bubble: bubble };
  }

  function appendAnchorBtn(row, href, label) {
    var btn = document.createElement('a');
    btn.className = 'cw-anchor-btn';
    btn.href = href;
    btn.textContent = label || '자세히 보기';
    btn.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
    row.appendChild(btn);
  }

  function typeText(bubble, text, onDone) {
    var i = 0;
    var speed = Math.max(10, Math.min(25, Math.floor(1200 / text.length)));
    bubble.textContent = '';
    function tick() {
      if (i < text.length) {
        bubble.textContent += text[i++];
        scrollBottom();
        setTimeout(tick, speed);
      } else if (onDone) { onDone(); }
    }
    tick();
  }

  function sendMessage() {
    var query = inputEl.value.trim();
    if (!query || isBusy) return;
    isBusy = true;
    sendBtn.disabled = true;
    inputEl.value = '';
    appendUserMsg(query);
    showLoading();
    fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, session_id: SESSION_ID, sections: SECTION_MAP })
    })
    .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
    .then(function (data) {
      hideLoading();
      var text = (data.text || '').trim() || '답변을 가져오지 못했어요.';
      var anchor = data.anchor || null;
      var anchorLabel = data.anchor_label || '자세히 보기';
      var ref = createBotRow();
      typeText(ref.bubble, text, function () {
        if (anchor) appendAnchorBtn(ref.row, anchor, anchorLabel);
        isBusy = false;
        sendBtn.disabled = false;
      });
    })
    .catch(function () {
      hideLoading();
      var ref = createBotRow();
      ref.bubble.textContent = '죄송해요, 잠시 후 다시 시도해 주세요.';
      isBusy = false;
      sendBtn.disabled = false;
    });
  }

})();
