/* ============================================================
   HARLAN & VOSS — Contact form
   ============================================================ */
;(function () {
  const OWNER_EMAIL = 'saadabdullah7599@gmail.com'
  const $ = (s) => document.querySelector(s)

  function init() {
    const form = $('#contact-form')
    if (!form) return
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const checks = [
        ['#c-name', (v) => v.trim().length > 1],
        ['#c-email', (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)],
        ['#c-phone', () => true],
        ['#c-area', () => true],
        ['#c-msg', (v) => v.trim().length > 3],
      ]
      let ok = true
      checks.forEach(([sel, test]) => {
        const input = $(sel)
        const field = input.closest('.field')
        if (!test(input.value)) { field.classList.add('invalid'); ok = false } else field.classList.remove('invalid')
      })
      if (!ok) {
        $('#contact-alert').classList.add('show')
        $('#contact-alert').textContent = 'Please correct the highlighted fields and try again.'
        return
      }
      $('#contact-alert').classList.remove('show')

      fetch('https://formsubmit.co/ajax/' + OWNER_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Contact form: ' + ($('#c-area').value || 'General enquiry'),
          _template: 'table', _captcha: 'false',
          Source: 'Harlan & Voss, contact page',
          Name: $('#c-name').value,
          Email: $('#c-email').value,
          Phone: $('#c-phone').value,
          Area_of_Law: $('#c-area').value,
          Message: $('#c-msg').value,
        }),      }).catch(() => {})

      form.style.display = 'none'
      $('#contact-success').classList.add('show')
    })
  }

  document.addEventListener('DOMContentLoaded', init)
})()
