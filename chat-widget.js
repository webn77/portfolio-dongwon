/**
 * chat-widget.js — 이동원 포트폴리오 챗봇 위젯 (채널톡 스타일)
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

  var WELCOME_TEXT = '안녕하세요, 방문자님!\n\n포트폴리오에 대해 궁금한 점을 남겨주시면 빠르게 안내해 드리겠습니다.\n\n운영시간\n■ AI: 24시간 연중무휴';
  var WELCOME_CHIPS = ['결제 경력이 얼마나 돼요?', '가장 큰 성과는?', '팀 리드 경험 있나요?'];

  /* ===== STYLES ===== */
  var STYLE = [
    '#cw-root *{box-sizing:border-box;margin:0;padding:0}',

    /* Greeting */
    '#cw-greeting{position:fixed;bottom:96px;right:28px;background:#fff;',
    'border-radius:18px 18px 5px 18px;box-shadow:0 6px 28px rgba(0,0,0,.13);',
    'padding:15px 18px;max-width:260px;z-index:9999;',
    'display:flex;align-items:flex-start;gap:10px;',
    'animation:cwPopIn .35s cubic-bezier(.34,1.56,.64,1) forwards}',
    '#cw-greeting.cw-hidden{display:none}',
    '#cw-greeting-body{flex:1}',
    "#cw-greeting-label{font-size:11.5px;font-weight:700;color:#8B5CF6;margin-bottom:5px;font-family:'Pretendard',sans-serif}",
    "#cw-greeting-text{font-size:13.5px;line-height:1.6;color:#111827;font-family:'Pretendard',sans-serif}",
    '#cw-greeting-close{background:none;border:none;cursor:pointer;color:#D1D5DB;',
    'font-size:13px;padding:0;line-height:1;flex-shrink:0;margin-top:1px;transition:color .15s}',
    '#cw-greeting-close:hover{color:#9CA3AF}',

    /* FAB */
    '#cw-fab{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:50%;',
    'background:#7C3AED;border:none;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 6px 20px rgba(124,58,237,.5);z-index:9999;',
    'transition:transform .2s,box-shadow .2s}',
    '#cw-fab:hover{transform:scale(1.06);box-shadow:0 8px 28px rgba(124,58,237,.6)}',
    '#cw-fab svg{color:#fff;display:block}',

    /* Window */
    '#cw-window{position:fixed;bottom:100px;right:28px;width:420px;background:#fff;',
    'border-radius:20px;',
    'box-shadow:0 16px 56px rgba(0,0,0,.18),0 2px 12px rgba(0,0,0,.07);',
    'z-index:9998;display:flex;flex-direction:column;overflow:hidden;',
    "font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;",
    'transition:opacity .22s,transform .22s;transform-origin:bottom right}',
    '#cw-window.cw-hidden{opacity:0;transform:scale(.92) translateY(14px);pointer-events:none}',

    /* Header */
    '.cw-header{background:#fff;border-bottom:1px solid #F0F0F5;',
    'padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '.cw-avatar{width:40px;height:40px;border-radius:50%;',
    'background:linear-gradient(135deg,#8B5CF6,#4A90D9);',
    'display:flex;align-items:center;justify-content:center;',
    'font-size:16px;font-weight:800;color:#fff;flex-shrink:0}',
    '.cw-header-info{flex:1}',
    '.cw-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:2px;letter-spacing:-.2px}',
    '.cw-status{display:flex;align-items:center;gap:5px;font-size:12px;color:#6B7280}',
    '.cw-status-dot{width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0}',
    '.cw-close{background:none;border:none;color:#9CA3AF;width:32px;height:32px;border-radius:50%;',
    'cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;',
    'transition:background .15s,color .15s}',
    '.cw-close:hover{background:#F3F4F6;color:#374151}',

    /* Messages */
    '.cw-messages{flex:1;overflow-y:auto;padding:20px 18px 20px;display:flex;',
    'flex-direction:column;gap:16px;height:460px;background:#fff}',
    '.cw-messages::-webkit-scrollbar{width:4px}',
    '.cw-messages::-webkit-scrollbar-track{background:transparent}',
    '.cw-messages::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:2px}',
    '.cw-msg-row{display:flex;flex-direction:column}',
    '.cw-msg-row.user{align-items:flex-end}',
    '.cw-msg-row.bot{align-items:flex-start}',
    '.cw-bot-row{display:flex;align-items:flex-start;gap:10px}',
    '.cw-bot-icon{width:34px;height:34px;border-radius:50%;',
    'background:linear-gradient(135deg,#8B5CF6,#4A90D9);',
    'display:flex;align-items:center;justify-content:center;',
    'font-size:13px;font-weight:800;color:#fff;flex-shrink:0;margin-top:2px}',
    '.cw-bot-content{flex:1;display:flex;flex-direction:column;gap:8px}',
    ".cw-bot-name{font-size:12px;font-weight:700;color:#6B7280;margin-bottom:2px;font-family:'Pretendard',sans-serif}",
    '.cw-bubble{padding:13px 16px;font-size:14px;line-height:1.7;word-break:break-word}',
    '.cw-msg-row.user .cw-bubble{background:#7C3AED;color:#fff;',
    'border-radius:18px 18px 4px 18px;max-width:72%;',
    'box-shadow:0 2px 10px rgba(124,58,237,.25)}',
    '.cw-msg-row.bot .cw-bubble{background:#F9FAFB;color:#111827;',
    'border-radius:4px 18px 18px 18px;border:1px solid #F0F0F5}',

    /* Chips */
    '.cw-chips-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}',
    '.cw-chip{font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:20px;',
    'border:1.5px solid #DDD6FE;color:#7C3AED;background:#F5F3FF;cursor:pointer;',
    "transition:all .15s;font-family:'Pretendard',sans-serif;white-space:nowrap}",
    '.cw-chip:hover{background:#7C3AED;color:#fff;border-color:#7C3AED}',

    /* Anchor */
    '.cw-anchor-btn{display:inline-flex;align-items:center;gap:5px;',
    'font-size:12.5px;font-weight:700;color:#7C3AED;border:1.5px solid #DDD6FE;',
    'background:#F5F3FF;padding:7px 14px;border-radius:20px;cursor:pointer;',
    "text-decoration:none;transition:all .15s;font-family:'Pretendard',sans-serif}",
    '.cw-anchor-btn:hover{background:#7C3AED;color:#fff;border-color:#7C3AED}',

    /* Loading */
    '.cw-loading{display:flex;align-items:center;gap:5px;padding:13px 16px;',
    'background:#F9FAFB;border:1px solid #F0F0F5;',
    'border-radius:4px 18px 18px 18px;width:fit-content}',
    '.cw-dot{width:6px;height:6px;border-radius:50%;background:#C4B5FD;',
    'animation:cwBounce 1.2s infinite ease-in-out}',
    '.cw-dot:nth-child(2){animation-delay:.2s}',
    '.cw-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes cwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',

    /* Input */
    '.cw-input-wrap{background:#fff;border-top:1px solid #F0F0F5;flex-shrink:0}',
    '.cw-input-row{display:flex;align-items:center;gap:8px;padding:12px 14px}',
    "#cw-input{flex:1;border:none;outline:none;font-size:14px;font-family:'Pretendard',sans-serif;",
    'color:#111827;background:transparent;padding:4px 0}',
    '#cw-input::placeholder{color:#9CA3AF}',
    '.cw-input-actions{display:flex;align-items:center;gap:4px;flex-shrink:0}',
    '.cw-icon-btn{background:none;border:none;cursor:pointer;color:#9CA3AF;padding:6px;',
    'display:flex;align-items:center;justify-content:center;border-radius:50%;',
    'transition:color .15s,background .15s}',
    '.cw-icon-btn:hover{color:#6B7280;background:#F3F4F6}',
    '#cw-send{width:36px;height:36px;border-radius:50%;background:#7C3AED;border:none;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    'transition:opacity .2s,transform .15s;box-shadow:0 2px 8px rgba(124,58,237,.35)}',
    '#cw-send:hover{opacity:.88;transform:scale(1.06)}',
    '#cw-send:disabled{opacity:.35;cursor:default;transform:none;box-shadow:none}',
    '#cw-send svg{color:#fff;display:block}',
    ".cw-disclaimer{font-size:11px;color:#9CA3AF;text-align:center;",
    "padding:0 16px 12px;line-height:1.5;font-family:'Pretendard',sans-serif}",

    '@keyframes cwPopIn{from{opacity:0;transform:scale(.85) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
    '@media(max-width:480px){',
    '#cw-window{width:calc(100vw - 16px);right:8px;bottom:96px;border-radius:16px}',
    '#cw-greeting{right:8px}#cw-fab{right:16px;bottom:20px}}'
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
    '    <div id="cw-greeting-label">이동원 AI 어시스턴트</div>',
    '    <div id="cw-greeting-text">👋 안녕하세요!<br>포트폴리오에 대해 궁금한 것을 물어보세요.</div>',
    '  </div>',
    '  <button id="cw-greeting-close" aria-label="닫기">&#x2715;</button>',
    '</div>',
    '<button id="cw-fab" aria-label="채팅 열기">',
    '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"',
    '       stroke="currentColor" stroke-width="2"',
    '       stroke-linecap="round" stroke-linejoin="round">',
    '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    '  </svg>',
    '</button>',
    '<div id="cw-window" class="cw-hidden" role="dialog" aria-label="이동원 챗봇">',
    '  <div class="cw-header">',
    '    <div class="cw-avatar">이</div>',
    '    <div class="cw-header-info">',
    '      <div class="cw-name">이동원</div>',
    '      <div class="cw-status"><span class="cw-status-dot"></span>AI · 24시간 답변 가능</div>',
    '    </div>',
    '    <button class="cw-close" aria-label="닫기">&#x2715;</button>',
    '  </div>',
    '  <div id="cw-messages" class="cw-messages"></div>',
    '  <div class="cw-input-wrap">',
    '    <div class="cw-input-row">',
    '      <input id="cw-input" type="text" placeholder="AI에게 질문해 주세요." autocomplete="off" />',
    '      <div class="cw-input-actions">',
    '        <button id="cw-send" aria-label="전송">',
    '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"',
    '               stroke="currentColor" stroke-width="2.5"',
    '               stroke-linecap="round" stroke-linejoin="round">',
    '            <line x1="12" y1="19" x2="12" y2="5"/>',
    '            <polyline points="5 12 12 5 19 12"/>',
    '          </svg>',
    '        </button>',
    '      </div>',
    '    </div>',
    '    <div class="cw-disclaimer">AI는 한정된 데이터를 기반하니, 중요한 정보는 추가 확인을 권장해요.</div>',
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
  var greeting = document.getElementById('cw-greeting');
  var greetClose = document.getElementById('cw-greeting-close');

  var isOpen = false, isBusy = false, welcomed = false;

  function hideGreeting() { greeting.classList.add('cw-hidden'); }
  greetClose.addEventListener('click', function (e) { e.stopPropagation(); hideGreeting(); });
  setTimeout(hideGreeting, 8000);

  function showWelcome() {
    if (welcomed) return;
    welcomed = true;
    var row = document.createElement('div');
    row.className = 'cw-msg-row bot';
    var br = document.createElement('div');
    br.className = 'cw-bot-row';
    var icon = document.createElement('div');
    icon.className = 'cw-bot-icon';
    icon.textContent = '이';
    var content = document.createElement('div');
    content.className = 'cw-bot-content';
    var nameEl = document.createElement('div');
    nameEl.className = 'cw-bot-name';
    nameEl.textContent = '이동원';
    var bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = WELCOME_TEXT;
    var chipsRow = document.createElement('div');
    chipsRow.className = 'cw-chips-row';
    WELCOME_CHIPS.forEach(function (label) {
      var chip = document.createElement('button');
      chip.className = 'cw-chip';
      chip.textContent = label;
      chip.addEventListener('click', function () { inputEl.value = label; sendMessage(); });
      chipsRow.appendChild(chip);
    });
    content.appendChild(nameEl);
    content.appendChild(bubble);
    content.appendChild(chipsRow);
    br.appendChild(icon);
    br.appendChild(content);
    row.appendChild(br);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function toggleWindow() {
    isOpen = !isOpen;
    win.classList.toggle('cw-hidden', !isOpen);
    if (isOpen) { hideGreeting(); showWelcome(); inputEl.focus(); }
  }
  fab.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

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
    var content = document.createElement('div');
    content.className = 'cw-bot-content';
    var nameEl = document.createElement('div');
    nameEl.className = 'cw-bot-name';
    nameEl.textContent = '이동원';
    var bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    content.appendChild(nameEl);
    content.appendChild(bubble);
    br.appendChild(icon);
    br.appendChild(content);
    row.appendChild(br);
    messagesEl.appendChild(row);
    scrollBottom();
    return { container: content, bubble: bubble };
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

  function appendAnchorBtn(container, href, label) {
    var chipsRow = document.createElement('div');
    chipsRow.className = 'cw-chips-row';
    var btn = document.createElement('a');
    btn.className = 'cw-anchor-btn';
    btn.href = href;
    btn.textContent = label || '자세히 보기';
    btn.addEventListener('click', function (e) {
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
    chipsRow.appendChild(btn);
    container.appendChild(chipsRow);
  }

  function typeText(bubble, text, onDone) {
    var i = 0, speed = Math.max(8, Math.min(22, Math.floor(1200 / text.length)));
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
        if (data.anchor) appendAnchorBtn(ref.container, data.anchor, data.anchor_label || '자세히 보기');
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
