/* ============================================================
   HARLAN & VOSS — shared behaviour (v3)
   sticky nav · dropdown · side menu · reveal · ticker · marquee
   counters · parallax · year · open status
   ============================================================ */
;(function () {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const $ = (s, c) => (c || document).querySelector(s)
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)]

  document.addEventListener('DOMContentLoaded', () => {
    initNav()
    initSide()
    initReveal()
    initTicker()
    initMarquee()
    initCounters()
    initYear()
    initOpenStatus()
    initParallax()
    if (window.HVChat) window.HVChat.init()
  })

  function initNav() {
    const hdr = $('#hdr')
    if (hdr) {
      const onScroll = () => hdr.classList.toggle('stuck', window.scrollY > 10)
      onScroll()
      addEventListener('scroll', onScroll, { passive: true })
    }
    const path = location.pathname.split('/').pop() || 'index.html'
    const links = $$('.nav a, .nav-index a, .side-body a, .side-link, .drop a')
    links.forEach((a) => {
      const href = a.getAttribute('href') || ''
      if (href === path) a.classList.add('active')
    })
    const section = path.startsWith('practice-') && path !== 'practice-areas.html' ? 'practice-areas.html'
      : path.startsWith('insights-') ? 'insights.html' : ''
    if (section) links.forEach((a) => { if ((a.getAttribute('href') || '') === section) a.classList.add('active') })
  }

  function initSide() {
    const scrim = $('#side-scrim')
    const side = $('#side')
    if (!side) return
    const openBtn = $('#menu-btn')
    const closeBtn = $('#side-close')
    const open = () => { side.classList.add('open'); scrim.classList.add('open'); document.body.style.overflow = 'hidden' }
    const close = () => { side.classList.remove('open'); scrim.classList.remove('open'); document.body.style.overflow = '' }
    openBtn?.addEventListener('click', open)
    closeBtn?.addEventListener('click', close)
    scrim?.addEventListener('click', close)
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
    window.HVCloseSide = close
  }

  function initReveal() {
    const els = $$('.reveal, .reveal-l, .reveal-r, .reveal-scale')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )
    els.forEach((el) => io.observe(el))
  }

  function initTicker() {
    const tracks = $$('.ticker-track, .mtrack')
    if (!tracks.length) return
    const state = tracks.map((el) => ({ el, x: 0, w: 0 }))
    const measure = () => state.forEach((s) => (s.w = s.el.scrollWidth / 2))
    measure()
    let lastY = scrollY, vel = 0
    addEventListener('scroll', () => { vel = scrollY - lastY; lastY = scrollY }, { passive: true })
    ;(function tick() {
      vel *= 0.9
      state.forEach((s) => {
        if (!s.w) return
        s.x -= 0.45 + Math.abs(vel) * 0.12
        if (s.x <= -s.w) s.x += s.w
        s.el.style.transform = `translateX(${s.x}px)`
      })
      requestAnimationFrame(tick)
    })()
    addEventListener('resize', measure)
  }

  function initMarquee() { /* handled by initTicker for .mtrack */ }

  function initCounters() {
    const els = $$('[data-count]')
    if (!els.length) return
    const items = els.map((el) => ({ el, target: Number(el.dataset.count), suffix: el.dataset.suffix || '', prefix: el.dataset.prefix || '', raf: 0, v: 0 }))
    const run = (it) => {
      const step = () => {
        it.v += (it.target - it.v) * 0.12
        if (Math.abs(it.target - it.v) < 0.5) { it.v = it.target; it.el.textContent = it.prefix + Math.round(it.v).toLocaleString() + it.suffix; return }
        it.el.textContent = it.prefix + Math.round(it.v).toLocaleString() + it.suffix
        it.raf = requestAnimationFrame(step)
      }
      cancelAnimationFrame(it.raf); it.raf = requestAnimationFrame(step)
    }
    const reset = (it) => { cancelAnimationFrame(it.raf); it.v = 0; it.el.textContent = it.prefix + '0' + it.suffix }
    items.forEach((it) => (it.el.textContent = it.prefix + '0' + it.suffix))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        const it = items.find((x) => x.el === en.target)
        if (!it) return
        if (en.isIntersecting) run(it); else reset(it)
      }),
      { threshold: 0.5 },
    )
    els.forEach((el) => io.observe(el))
  }

  function initYear() { $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear())) }

  function initOpenStatus() {
    const els = $$('[data-open-status]')
    if (!els.length) return
    const now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes()
    let open = false
    if (day >= 1 && day <= 5) open = mins >= 510 && mins < 1080
    else if (day === 6) open = mins >= 600 && mins < 840
    els.forEach((el) => {
      el.textContent = open ? 'Open now' : 'Closed, request a callback 24/7'
      el.classList.toggle('is-open', open)
    })
  }

  function initParallax() {
    const els = $$('[data-parallax]')
    if (!els.length || RM) return
    addEventListener('scroll', () => {
      const y = scrollY
      els.forEach((el) => { el.style.transform = `translate3d(0, ${(y * (Number(el.dataset.parallax) || 0.12)).toFixed(1)}px, 0)` })
    }, { passive: true })
  }
})()
