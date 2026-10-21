/* ============================================================
   HARLAN & VOSS — Intake Assistant (floating widget, bottom right)
   Scripted conversation, quick replies, lead capture.
   ============================================================ */
;(function () {
  const OWNER_EMAIL = 'saadabdullah7599@gmail.com'
  const $ = (s, c) => (c || document).querySelector(s)

  let panel, body, input, chips, fab, sent
  let step = 0
  const lead = {}

  const FLOW = [
    { bot: 'Good day. I am Claire, the firm intake assistant. What kind of matter can we help you with?', chips: ['Personal injury', 'Criminal defense', 'Immigration', 'Business dispute', 'Family law', 'Something else'], key: 'matter' },
    { bot: 'Understood. When did this happen? A rough timeframe is fine, it matters for filing deadlines.', chips: ['Within the last month', '1 to 6 months ago', '6 to 12 months ago', 'Over a year ago'], key: 'when' },
    { bot: 'Are you in the Los Angeles area, or somewhere else in Southern California?', chips: ['Los Angeles', 'Orange County', 'San Diego', 'Riverside / San Bernardino', 'Elsewhere'], key: 'location' },
    { bot: 'Have you already spoken with another attorney about this?', chips: ['No, first time', 'Yes, briefly', 'Yes, but it did not work out'], key: 'prior' },
    { bot: 'A free, confidential consultation is the next step. What is the best name to reach you?', free: true, key: 'name' },
    { bot: 'Thank you. What is the best phone number or email to reach you on?', free: true, key: 'contact' },
  ]

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  function addMsg(text, who) {
    const el = document.createElement('div')
    el.className = 'msg ' + who
    el.innerHTML = esc(text)
    body.appendChild(el)
    body.scrollTop = body.scrollHeight
  }
  function typing() {
    const el = document.createElement('div')
    el.className = 'msg bot'
    el.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>'
    body.appendChild(el)
    body.scrollTop = body.scrollHeight
    return el
  }
  function renderChips(list) {
    chips.innerHTML = ''
    ;(list || []).forEach((label) => {
      const b = document.createElement('button')
      b.className = 'chat-chip'
      b.textContent = label
      b.addEventListener('click', () => answer(label))
      chips.appendChild(b)
    })
  }
  function answer(text) {
    chips.innerHTML = ''
    addMsg(text, 'user')
    const cur = FLOW[step]
    if (cur) lead[cur.key] = text
    step++
    setTimeout(next, 460)
  }
  function next() {
    const s = FLOW[step]
    if (!s) return finish()
    const t = typing()
    setTimeout(() => {
      t.remove()
      addMsg(s.bot, 'bot')
      if (s.free) { input.placeholder = s.key === 'name' ? 'Your name' : 'Phone or email'; input.focus() }
      else input.placeholder = 'Or type your answer'
      renderChips(s.chips)
    }, 580)
  }
  function finish() {
    const t = typing()
    setTimeout(() => {
      t.remove()
      addMsg('Perfect, that is all I need. I have passed this to our team and an attorney will reach out to arrange your free consultation. Is there anything else?', 'bot')
      send()
      renderChips(['Book a time now', 'Start over'])
      chips.querySelectorAll('.chat-chip').forEach((c) => c.addEventListener('click', () => {
        if (c.textContent === 'Book a time now') location.href = 'booking.html'
        else location.reload()
      }))
    }, 660)
  }
  function send() {
    if (sent || !lead.contact) return
    sent = true
    fetch('https://formsubmit.co/ajax/' + OWNER_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Chat intake: ' + (lead.matter || 'New enquiry') + (lead.name ? ' - ' + lead.name : ''),
        _template: 'table', _captcha: 'false',
        Source: 'Harlan & Voss, chat widget',
        Name: lead.name || '(not given)',
        Contact: lead.contact || '(not given)',
        Matter: lead.matter || '',
        Timing: lead.when || '',
        Location: lead.location || '',
        Prior_Attorney: lead.prior || '',
      }),
    }).catch(() => {})
  }

  function build() {
    if ($('#chat-fab')) return
    const el = document.createElement('div')
    el.innerHTML =
      '<button id="chat-fab" aria-label="Open intake assistant">' +
      '<span class="dot"></span>' +
      '<span class="badge">Questions? Ask us</span>' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-8 8H4l1.5-4A8 8 0 1 1 21 12Z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div id="chat-panel" role="dialog" aria-label="Intake assistant">' +
      '<div class="chat-head"><div class="av">C</div><div><b>Intake Assistant</b><small>Online now</small></div>' +
      '<button class="chat-close" aria-label="Close">&times;</button></div>' +
      '<div id="chat-body"></div>' +
      '<div class="chat-chips"></div>' +
      '<div class="chat-foot"><input type="text" placeholder="Type your message" aria-label="Message" />' +
      '<button aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
      '</div>'
    document.body.appendChild(el)

    fab = $('#chat-fab', el)
    panel = $('#chat-panel', el)
    body = $('#chat-body', el)
    input = $('.chat-foot input', el)
    chips = $('.chat-chips', el)

    fab.addEventListener('click', openPanel)
    $('.chat-close', el).addEventListener('click', closePanel)
    $('.chat-foot button', el).addEventListener('click', () => {
      const v = input.value.trim()
      if (!v) return
      input.value = ''
      answer(v)
    })
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('.chat-foot button', el).click() })

    setTimeout(() => { if (!panel.classList.contains('open')) fab.classList.add('tease') }, 4500)
  }

  function openPanel() {
    fab.classList.remove('tease')
    panel.classList.add('open')
    if (!body.childElementCount) {
      addMsg('Good day. I am Claire, the firm intake assistant. What kind of matter can we help you with?', 'bot')
      renderChips(FLOW[0].chips)
    }
  }
  function closePanel() { panel.classList.remove('open') }

  window.HVChat = { init: build }
})()
