/* ============================================================
   HARLAN & VOSS — Case Strength Analyzer
   6 factor weighted model, gauge reveal, deadline countdown
   ============================================================ */
;(function () {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const $ = (s, c) => (c || document).querySelector(s)
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)]

  const WEIGHTS = {
    type: { injury: 9, criminal: 8, immigration: 7, business: 7, family: 6, other: 4 },
    timing: { recent: 10, soon: 8, old: 5, stale: 2 },
    evidence: { strong: 10, some: 7, little: 4, none: 2 },
    fault: { clear: 10, mostly: 7, unclear: 4, self: 2 },
    harm: { major: 10, moderate: 7, minor: 4, unclear: 3 },
    rep: { no: 6, yes: 8, dropped: 6 },
  }
  const LABELS = {
    type: { injury: 'Personal injury', criminal: 'Criminal defense', immigration: 'Immigration', business: 'Business / civil', family: 'Family law', other: 'General matter' },
    timing: { recent: 'Happened recently', soon: '1 to 6 months ago', old: '6 to 12 months ago', stale: 'Over a year ago' },
    evidence: { strong: 'Strong documentation', some: 'Some documentation', little: 'Limited documentation', none: 'No documentation yet' },
    fault: { clear: 'Fault is clear', mostly: 'Some dispute on fault', unclear: 'Fault unclear', self: 'Possible shared fault' },
    harm: { major: 'Serious harm or loss', moderate: 'Moderate harm or loss', minor: 'Minor or resolved harm', unclear: 'Extent unclear' },
    rep: { no: 'First attorney contact', yes: 'Has spoken with counsel', dropped: 'Prior representation ended' },
  }
  // months of limitation by matter type
  const LIMIT_MONTHS = { injury: 24, criminal: 12, immigration: 6, business: 48, family: 60, other: 24 }

  const state = { keys: [], step: 0, busy: false }
  const answers = {}

  function init() {
    const root = $('#analyzer-root')
    if (!root) return
    $$('.an-opts button').forEach((b) => b.addEventListener('click', () => choose(b)))
    $('#an-back').addEventListener('click', back)
    $('#an-restart').addEventListener('click', restart)
  }

  function choose(btn) {
    if (state.busy) return
    state.busy = true
    const stepEl = btn.closest('.an-step')
    $$('button', stepEl).forEach((b) => b.classList.remove('chosen'))
    btn.classList.add('chosen')
    answers[btn.dataset.factor] = btn.dataset.value
    setTimeout(() => { state.busy = false; advance() }, 240)
  }

  function advance() {
    state.step++
    if (state.step >= 6) return showResult()
    goto(state.step)
    $('#an-back').disabled = false
    updateProgress()
  }
  function back() {
    if (state.step === 0) return
    state.step--
    goto(state.step)
    $('#an-back').disabled = state.step === 0
    updateProgress()
  }
  function goto(i) {
    $$('.an-step').forEach((el) => (el.hidden = Number(el.dataset.step) !== i))
    $('#an-back').disabled = i === 0
  }
  function updateProgress() {
    $('#an-step-label').textContent = 'Question ' + (state.step + 1) + ' of 6'
    $('#an-bar').style.width = ((state.step + 1) / 6) * 100 + '%'
  }
  function restart() {
    state.step = 0
    Object.keys(answers).forEach((k) => delete answers[k])
    $$('.an-opts button').forEach((b) => b.classList.remove('chosen'))
    $('#an-result').hidden = true
    $('#an-steps').hidden = false
    $('.an-nav').style.display = 'flex'
    $('.an-progress').style.display = 'flex'
    goto(0); updateProgress()
  }

  function score() {
    let total = 0, max = 0
    Object.keys(WEIGHTS).forEach((k) => {
      const v = WEIGHTS[k][answers[k]]
      max += 10
      total += v == null ? 5 : v
    })
    return Math.round((total / max) * 100)
  }

  function band(p) {
    if (p >= 78) return { label: 'Strong', text: 'Based on your answers, your matter shows strong indicators. It is worth speaking with an attorney promptly so no deadline passes and the best strategy is set early.' }
    if (p >= 58) return { label: 'Promising', text: 'Your matter shows promising indicators, though some factors could strengthen it. A free consultation can tell you how to shore up the weaker points.' }
    if (p >= 38) return { label: 'Worth reviewing', text: 'Your matter raises real questions that deserve a closer look. Many cases that appear uncertain at first turn out to be viable once the evidence is examined.' }
    return { label: 'Speak with us', text: 'Based on your answers, several factors could limit a claim, but only a full review can say for sure. Deadlines and small details often change the picture, so it is worth a conversation.' }
  }

  function showResult() {
    $('#an-steps').hidden = true
    $('.an-nav').style.display = 'none'
    $('.an-progress').style.display = 'none'
    const res = $('#an-result')
    res.hidden = false
    const p = score()
    const b = band(p)
    $('#an-verdict').textContent = b.label
    $('#an-summary').textContent = b.text

    // animate arc (dasharray 283)
    const arc = $('#an-arc')
    let v = 0
    const start = performance.now()
    const dur = RM ? 1 : 1100
    const run = (t) => {
      const k = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      v = Math.round(p * e)
      $('#an-score-num').textContent = v
      arc.style.strokeDashoffset = String(283 - (283 * (v / 100)))
      if (k < 1) requestAnimationFrame(run)
    }
    requestAnimationFrame(run)

    // deadline
    const months = LIMIT_MONTHS[answers.type] || 24
    const dl = new Date()
    dl.setMonth(dl.getMonth() + months)
    const days = Math.round((dl - new Date()) / 86400000)
    $('#an-deadline').innerHTML = '<b>Estimated filing window:</b> ' + months + ' months for this matter type, putting a date around <b>' +
      dl.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '</b> (about ' + days.toLocaleString() + ' days from today). Confirm this with an attorney, as rules and exceptions vary.'

    // factor list
    const ul = $('#an-factors')
    ul.innerHTML = ''
    Object.keys(answers).forEach((k) => {
      const li = document.createElement('li')
      li.textContent = LABELS[k][answers[k]]
      ul.appendChild(li)
    })
    res.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' })
  }

  document.addEventListener('DOMContentLoaded', init)
})()
