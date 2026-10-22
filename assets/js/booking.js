/* ============================================================
   HARLAN & VOSS — Booking
   date picker -> time slots -> format -> details -> submit
   ============================================================ */
;(function () {
  const OWNER_EMAIL = 'opencode@gmail.com'
  const $ = (s, c) => (c || document).querySelector(s)
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)]

  const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
  const MODE_LABEL = { office: 'In office (downtown LA)', phone: 'Phone call', video: 'Video meeting' }

  const state = { step: 0, date: null, time: null, mode: null }
  let dates = []

  function seed(str) {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
    return (h >>> 0)
  }

  function buildDates() {
    dates = []
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    for (let i = 1; dates.length < 12; i++) {
      const day = new Date(d)
      day.setDate(d.getDate() + i)
      if (day.getDay() === 0) continue
      dates.push(day)
    }
  }

  function init() {
    if (!$('#date-list')) return
    buildDates()
    renderDates()
    $('#bk-back').addEventListener('click', back)
    $('#bk-next').addEventListener('click', next)
    $('#booking-form')?.addEventListener('submit', submit)
    renderModes()
  }

  function renderDates() {
    const list = $('#date-list')
    list.innerHTML = ''
    dates.forEach((day) => {
      const b = document.createElement('button')
      b.className = 'date-btn'
      b.innerHTML = '<small>' + day.toLocaleDateString('en-US', { weekday: 'short' }) + '</small>' + day.getDate() + '<small>' + day.toLocaleDateString('en-US', { month: 'short' }) + '</small>'
      b.addEventListener('click', () => {
        $$('.date-btn', list).forEach((x) => x.classList.remove('chosen'))
        b.classList.add('chosen')
        state.date = day
        $('#sum-date').textContent = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        renderSlots()
        $('#bk-next').disabled = false
      })
      list.appendChild(b)
    })
  }

  function renderSlots() {
    const grid = $('#slot-grid')
    grid.innerHTML = ''
    $('#slot-date-label').textContent = state.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const isSat = state.date.getDay() === 6
    const times = isSat ? TIMES.filter((t) => /AM/.test(t)) : TIMES
    times.forEach((t) => {
      const key = state.date.toDateString() + '|' + t
      const taken = seed(key) % 5 === 0
      const b = document.createElement('button')
      b.className = 'slot' + (taken ? ' taken' : '')
      b.textContent = t
      b.disabled = taken
      b.addEventListener('click', () => {
        $$('.slot', grid).forEach((x) => x.classList.remove('chosen'))
        b.classList.add('chosen')
        state.time = t
        $('#sum-time').textContent = t
        $('#bk-next').disabled = false
      })
      grid.appendChild(b)
    })
  }

  function renderModes() {
    $$('#mode-opts button').forEach((b) => {
      b.addEventListener('click', () => {
        $$('#mode-opts button').forEach((x) => x.classList.remove('chosen'))
        b.classList.add('chosen')
        state.mode = b.dataset.mode
        $('#sum-mode').textContent = MODE_LABEL[state.mode]
        if (state.step === 2) $('#bk-next').disabled = false
      })
    })
  }

  function showStep(i) {
    state.step = i
    $$('.bk-step[data-bk]').forEach((el) => (el.hidden = Number(el.dataset.bk) !== i))
    $$('.bk-step-ind').forEach((el) => {
      const n = Number(el.dataset.ind)
      el.classList.toggle('active', n === i)
      el.classList.toggle('done', n < i)
    })
    $('#bk-back').disabled = i === 0
    const isLast = i === 3
    $('#bk-next').hidden = isLast
    // enable next only if current step answered
    if (i === 0) $('#bk-next').disabled = !state.date
    if (i === 1) $('#bk-next').disabled = !state.time
    if (i === 2) $('#bk-next').disabled = !state.mode
  }

  function next() { if (state.step < 3) showStep(state.step + 1) }
  function back() { if (state.step > 0) showStep(state.step - 1) }

  function validate() {
    let ok = true
    const checks = [
      ['#b-name', (v) => v.trim().length > 1],
      ['#b-email', (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)],
      ['#b-phone', (v) => v.replace(/\D/g, '').length >= 7],
      ['#b-area', (v) => v !== ''],
    ]
    checks.forEach(([sel, test]) => {
      const input = $(sel)
      const field = input.closest('.field')
      if (!test(input.value)) { field.classList.add('invalid'); ok = false }
      else field.classList.remove('invalid')
    })
    return ok
  }

  function ref() {
    let n = 0
    for (let i = 0; i < 5; i++) n += seed(state.date.toDateString() + state.time + i) % 10
    return 'HV-' + String(n + 10000).slice(-5)
  }

  function submit(e) {
    e.preventDefault()
    if (!validate()) {
      $('#booking-alert').classList.add('show')
      $('#booking-alert').textContent = 'Please correct the highlighted fields and try again.'
      return
    }
    $('#booking-alert').classList.remove('show')
    const payload = {
      _subject: 'Booking: ' + state.date.toLocaleDateString() + ' ' + state.time + ' (' + MODE_LABEL[state.mode] + ')',
      _template: 'table', _captcha: 'false',
      Source: 'Harlan & Voss, booking page',
      Name: $('#b-name').value,
      Email: $('#b-email').value,
      Phone: $('#b-phone').value,
      Area_of_Law: $('#b-area').value,
      Date: state.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      Time: state.time,
      Format: MODE_LABEL[state.mode],
      Notes: $('#b-notes').value,
      Reference: ref(),
    }
    fetch('https://formsubmit.co/ajax/' + OWNER_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})

    $('#booking-form').style.display = 'none'
    $('#booking-ref').textContent = payload.Reference
    $('#booking-success').classList.add('show')
    $('#bk-next').hidden = true
    $('#bk-back').hidden = true
    window.scrollTo({ top: $('#booking-success').offsetTop - 120, behavior: 'smooth' })
  }

  document.addEventListener('DOMContentLoaded', init)
})()
