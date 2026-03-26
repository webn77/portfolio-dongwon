/**
 * chat-widget.js — 이동원 포트폴리오 챗봇 위젯
 *
 * 삽입 방법:
 *   <script src="chat-widget.js"
 *           data-api="http://localhost:8000"
 *           data-section-map='{"career":"#timeline","projects":"#cases",...}'>
 *   </script>
 *
 * 응답 형식: { text: string, anchor?: string, anchor_label?: string }
 */
(function () {
  'use strict';

  /* ---- Read config from script tag ---- */
  var script      = document.currentScript;
  var API_BASE    = (script && script.getAttribute('data-api'))         || 'https://adaptation-stretch-premises-ready.trycloudflare.com';
  var sectionRaw  = (script && script.getAttribute('data-section-map')) || '{}';
  var SECTION_MAP = {};
  try { SECTION_MAP = JSON.parse(sectionRaw); } catch (e) {}

  /* ---- Session ID (UUID v4) ---- */
  var SESSION_ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  /* =========================================
     STYLES
     ========================================= */
  var STYLE = [
    '#cw-root *{box-sizing:border-box;margin:0;padding:0}',

    /* FAB */
    '#cw-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 60%,#E87CA0 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 4px 20px rgba(74,144,217,.45);z-index:9999;',
    'transition:transform .2s,box-shadow .2s}',
    '#cw-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(74,144,217,.55)}',
    '#cw-fab svg{color:#fff;display:block}',

    /* Window */
    '#cw-window{position:fixed;bottom:92px;right:24px;width:340px;background:#fff;',
    'border-radius:16px;',
    'box-shadow:0 20px 60px -10px rgba(26,39,68,.22),0 4px 20px rgba(26,39,68,.10);',
    'z-index:9998;display:flex;flex-direction:column;overflow:hidden;',
    "font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;",
    'transition:opacity .25s,transform .25s;transform-origin:bottom right}',
    '#cw-window.cw-hidden{opacity:0;transform:scale(.9) translateY(10px);pointer-events:none}',

    /* Header */
    '.cw-header{background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 60%,#E87CA0 100%);',
    'padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}',
    '.cw-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.25);',
    'border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;',
    'font-size:15px;font-weight:800;color:#fff;flex-shrink:0}',
    '.cw-title{flex:1;font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px}',
    '.cw-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;',
    'border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;',
    'justify-content:center;transition:background .2s;flex-shrink:0;line-height:1}',
    '.cw-close:hover{background:rgba(255,255,255,.35)}',

    /* Chips */
    '.cw-suggestions{padding:10px 12px 8px;display:flex;gap:6px;flex-wrap:wrap;',
    'border-bottom:1px solid #F3F4F6;flex-shrink:0}',
    '.cw-chip{font-size:11px;font-weight:600;padding:5px 10px;border-radius:20px;',
    'border:1.5px solid #7B5EA7;color:#7B5EA7;background:transparent;cursor:pointer;',
    "transition:background .15s,color .15s;font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;white-space:nowrap}",
    '.cw-chip:hover{background:#7B5EA7;color:#fff}',

    /* Messages */
    '.cw-messages{flex:1;overflow-y:auto;padding:14px 12px;display:flex;',
    'flex-direction:column;gap:10px;max-height:360px;min-height:80px}',
    '.cw-messages::-webkit-scrollbar{width:4px}',
    '.cw-messages::-webkit-scrollbar-track{background:transparent}',
    '.cw-messages::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}',
    '.cw-msg-row{display:flex;flex-direction:column}',
    '.cw-msg-row.user{align-items:flex-end}',
    '.cw-msg-row.bot{align-items:flex-start}',
    '.cw-bubble{max-width:84%;padding:9px 13px;border-radius:14px;',
    'font-size:13px;line-height:1.6;word-break:break-word}',
    '.cw-msg-row.user .cw-bubble{',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 60%,#E87CA0 100%);',
    'color:#fff;border-bottom-right-radius:4px}',
    '.cw-msg-row.bot .cw-bubble{background:#F3F4F6;color:#111827;border-bottom-left-radius:4px}',

    /* Anchor button */
    '.cw-anchor-btn{margin-top:6px;display:inline-flex;align-items:center;gap:4px;',
    'font-size:11px;font-weight:700;color:#7B5EA7;border:1.5px solid #7B5EA7;',
    'background:transparent;padding:4px 10px;border-radius:20px;cursor:pointer;',
    "text-decoration:none;transition:background .15s,color .15s;",
    "font-family:'Pretendard','Apple SD Gothic Neo',sans-serif}",
    '.cw-anchor-btn:hover{background:#7B5EA7;color:#fff}',

    /* Loading dots */
    '.cw-loading{display:flex;align-items:center;gap:5px;padding:10px 13px;',
    'background:#F3F4F6;border-radius:14px;border-bottom-left-radius:4px;width:fit-content}',
    '.cw-dot{width:6px;height:6px;border-radius:50%;background:#9CA3AF;',
    'animation:cwBounce 1.2s infinite ease-in-out}',
    '.cw-dot:nth-child(2){animation-delay:.2s}',
    '.cw-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes cwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',

    /* Input */
    '.cw-input-row{display:flex;align-items:center;gap:8px;padding:10px 12px;',
    'border-top:1px solid #F3F4F6;flex-shrink:0}',
    "#cw-input{flex:1;border:1.5px solid #E5E7EB;border-radius:22px;padding:8px 14px;",
    "font-size:13px;font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;",
    'outline:none;color:#111827;background:#FAFAFA;transition:border-color .2s}',
    '#cw-input::placeholder{color:#9CA3AF}',
    '#cw-input:focus{border-color:#7B5EA7;background:#fff}',
    '#cw-send{width:36px;height:36px;border-radius:50%;',
    'background:linear-gradient(135deg,#4A90D9 0%,#7B5EA7 60%,#E87CA0 100%);',
    'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;transition:opacity .2s,transform .15s}',
    '#cw-send:hover{opacity:.88;transform:scale(1.06)}',
    '#cw-send:disabled{opacity:.45;cursor:default;transform:none}',
    '#cw-send svg{color:#fff;display:block}',
    '@media(max-width:400px){#cw-window{width:calc(100vw - 16px);right:8px}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  /* =========================================
     HTML
     ========================================= */
  var root = document.createElement('div');
  root.id = 'cw-root';
  root.innerHTML = [
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
    '    <span class="cw-title">이동원에게 물어보기</span>',
    '    <button class="cw-close" aria-label="닫기">&#x2715;</button>',
    '  </div>',
    '  <div class="cw-suggestions">',
    '    <button class="cw-chip">결제 경력이 얼마나 돼요?</button>',
    '    <button class="cw-chip">가장 큰 성과는?</button>',
    '    <button class="cw-chip">팀 리드 경험 있나요?</button>',
    '  </div>',
    '  <div id="cw-messages" class="cw-messages"></div>',
    '  <div class="cw-input-row">',
    '    <input id="cw-input" type="text"',
    '           placeholder="궁금한 점을 물어보세요..."',
    '           autocomplete="off" />',
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

  /* =========================================
     LOGIC
     ========================================= */
  var fab        = document.getElementById('cw-fab');
  var win        = document.getElementById('cw-window');
  var closeBtn   = win.querySelector('.cw-close');
  var messagesEl = document.getElementById('cw-messages');
  var inputEl    = document.getElementById('cw-input');
  var sendBtn    = document.getElementById('cw-send');
  var chips      = win.querySelectorAll('.cw-chip');

  var isOpen = false;
  var isBusy = false;

  /* Toggle */
  function toggleWindow() {
    isOpen = !isOpen;
    win.classList.toggle('cw-hidden', !isOpen);
    if (isOpen) inputEl.focus();
  }
  fab.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

  /* Chips */
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      inputEl.value = chip.textContent.trim();
      sendMessage();
    });
  });

  /* Input */
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  /* Helpers */
  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function resolveAnchor(anchor) {
    return SECTION_MAP[anchor] || anchor;
  }

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
    var dots = document.createElement('div');
    dots.className = 'cw-loading';
    dots.innerHTML = '<div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>';
    row.appendChild(dots);
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
    var bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    row.appendChild(bubble);
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
    var speed = Math.max(10, Math.min(28, Math.floor(1400 / text.length)));
    bubble.textContent = '';
    function tick() {
      if (i < text.length) {
        bubble.textContent += text[i++];
        scrollBottom();
        setTimeout(tick, speed);
      } else {
        if (onDone) onDone();
      }
    }
    tick();
  }

  /* Send */
  function sendMessage() {
    var query = inputEl.value.trim();
    if (!query || isBusy) return;

    isBusy = true;
    sendBtn.disabled = true;
    inputEl.value = '';

    appendUserMsg(query);
    showLoading();

    fetch(API_BASE + '/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query:      query,
        session_id: SESSION_ID,
        sections:   SECTION_MAP
      })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      hideLoading();
      var text        = (data.text || '').trim() || '답변을 가져오지 못했어요.';
      var anchor      = data.anchor ? resolveAnchor(data.anchor) : null;
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
