import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import works from './works.json'
import { FORMSPREE_ID, SKILLS, CATS, TIMELINE, SOCIAL } from './config.js'
import { LinkedIn, GitHub, Mail } from './icons.jsx'
import { siFirebase, siGreensock, siTypescript, siJavascript, siBootstrap, siCss, siHtml5, siGithub, siReact, siOpenjdk, siTailwindcss } from 'simple-icons'
import { Palette, LayoutTemplate, CodeXml } from 'lucide-react'
const B = (i, dark) => ({ path: i.path, color: '#' + i.hex, dark })
const ICONS = { html5: B(siHtml5), css: B(siCss), bootstrap: B(siBootstrap), javascript: B(siJavascript), react: B(siReact), gsap: B(siGreensock),
  typescript: B(siTypescript), firebase: B(siFirebase), github: B(siGithub, true), java: B(siOpenjdk, true),
  palette: { L: Palette }, layout: { L: LayoutTemplate }, code: { L: CodeXml }, tailwind: B(siTailwindcss), es5: { text: 'ES5', color: '#C9A100' } }
gsap.registerPlugin(ScrollTrigger)
const NAV = ['work', 'about', 'skills', 'experience', 'contact']

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const CIRC = 2 * Math.PI * 52
const Chars = ({ text }) => text.split(' ').map((w, i) => (
  <span className="word" key={i}>{[...w].map((c, j) => <span className="ch" key={j}>{c}</span>)}&nbsp;</span>))
const Head = ({ n, title }) => (
  <div className="section-head"><span className="section-num" data-r="up">{n}</span>
    <h2 className="section-title h-mask"><span>{title}</span></h2></div>)

function Ring({ s }) {
  const ic = ICONS[s.icon], L = ic.L
  return (
    <div className="ring" data-v={s.value}>
      <div className="ring-wrap">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="ring-bg" cx="60" cy="60" r="52" />
          <circle className="ring-fg" cx="60" cy="60" r="52" strokeDasharray={CIRC} strokeDashoffset={CIRC} />
        </svg>
        <span className={`ring-ic${ic.dark ? ' dk' : ''}`} style={ic.color ? { color: ic.color } : null}>
          {ic.path ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ic.path} fill="currentColor" /></svg> : L ? <L size={32} strokeWidth={1.6} /> : <b>{ic.text}</b>}
        </span>
      </div>
      <p>{s.name}</p><span className="ring-pct">0%</span>
    </div>)
}

function Lightbox({ list, index, onClose, onNav }) {
  const ref = useRef(null), imgRef = useRef(null)
  useLayoutEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: .35 })
    gsap.fromTo(imgRef.current, { scale: .92, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .6, ease: 'power3.out' })
  }, [index])
  const close = useCallback(() => gsap.to(ref.current, { opacity: 0, duration: .25, onComplete: onClose }), [onClose])
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') onNav(1); if (e.key === 'ArrowLeft') onNav(-1) }
    addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [close, onNav])
  const w = list[index]
  return (
    <div className="lightbox" ref={ref} onClick={close} role="dialog" aria-modal="true" aria-label={w.title}>
      <button className="lb-btn lb-close" onClick={close} aria-label="Close">✕</button>
      <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); onNav(-1) }} aria-label="Previous">←</button>
      <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); onNav(1) }} aria-label="Next">→</button>
      <img ref={imgRef} src={`./work/${w.id}.webp`} alt={w.title} onClick={e => e.stopPropagation()} />
      <div className="lb-cap">{w.title} <span>{index + 1} / {list.length}</span></div>
    </div>)
}

function Tabs({ cat, setCat }) {
  const ref = useRef(null)
  const place = useCallback(() => {
    const el = ref.current, b = el && el.querySelector('.tab.active'); if (!b) return
    gsap.to(el.querySelector('.tab-pill'), { x: b.offsetLeft, width: b.offsetWidth, duration: reduce ? 0 : .5, ease: 'power3.out' })
    if (el.scrollWidth > el.clientWidth) el.scrollTo({ left: b.offsetLeft - 24, behavior: 'smooth' })
  }, [])
  useLayoutEffect(() => { place() }, [cat, place])
  useEffect(() => { addEventListener('resize', place); document.fonts && document.fonts.ready.then(place); return () => removeEventListener('resize', place) }, [place])
  return (
    <div className="tabs" ref={ref} role="tablist" data-r="up"><span className="tab-pill" />
      {CATS.map(([k, l]) => <button key={k} role="tab" aria-selected={cat === k} className={`tab${cat === k ? ' active' : ''}`} onClick={() => setCat(k)}>
        {l} <span className="count">{k === 'all' ? works.length : works.filter(w => w.cat === k).length}</span></button>)}
    </div>)
}

const useCols = () => {
  const calc = () => innerWidth < 700 ? 4 : innerWidth > 1700 ? 7 : 6
  const [n, setN] = useState(calc)
  useEffect(() => { const f = () => setN(calc()); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [])
  return n
}
function Stage({ list, onOpen }) {
  const ref = useRef(null), cols = useCols(), n = list.length, need = Math.max(4, Math.ceil(n / cols))
  const data = Array.from({ length: cols }, (_, ci) => Array.from({ length: need }, (_, k) => list[(n >= 10 ? ci + k * cols : ci * 2 + k) % n]))
  useLayoutEffect(() => {
    if (reduce) return
    const el = ref.current, tw = []
    const en = () => gsap.to(tw, { timeScale: .15, duration: .6 }), lv = () => gsap.to(tw, { timeScale: 1, duration: .8 })
    const ctx = gsap.context(() => {
      const cs = gsap.utils.toArray('.col')
      cs.forEach((c, i) => { const t = gsap.to(c.querySelector('.col-track'), { yPercent: -50, duration: need * (6 + i * 1.4), repeat: -1, ease: 'none' }); t.progress((i * .21) % 1); tw.push(t) })
      gsap.from(cs, { y: 200, opacity: 0, duration: 1.3, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: s => tw.forEach(t => s.isActive ? t.resume() : t.pause()) })
    }, ref)
    el.addEventListener('mouseenter', en); el.addEventListener('mouseleave', lv)
    return () => { el.removeEventListener('mouseenter', en); el.removeEventListener('mouseleave', lv); ctx.revert() }
  }, [list, cols])
  return (
    <div className="stage" ref={ref}><div className="stage-tilt">
      {data.map((col, ci) => (
        <div className="col" key={ci}><div className="col-track">
          {[...col, ...col].map((w, i) => (
            <div className="phone" key={i} role="button" tabIndex={i < need ? 0 : -1} aria-hidden={i >= need} aria-label={`Open ${w.title}`}
              onClick={() => onOpen(w.id)} onKeyDown={e => e.key === 'Enter' && onOpen(w.id)}>
              <div className="screen" style={{ background: `linear-gradient(${w.c1},${w.c2})` }}>
                <img src={`./work/${w.id}-p.webp`} alt={i < need ? w.title : ''} loading="lazy" draggable="false" className={w.r < .62 ? 'cover' : ''} />
              </div></div>))}
        </div></div>))}
    </div></div>)
}

function Contact() {
  const [state, setState] = useState('idle'), [err, setErr] = useState('')
  const formRef = useRef(null), okRef = useRef(null)
  const submit = async e => {
  e.preventDefault()
  const f = new FormData(formRef.current)
  if (f.get('_gotcha')) return
  if (!FORMSPREE_ID || FORMSPREE_ID === 'YOUR_FORM_ID') {
    setState('error'); setErr('Form ID is not set. Add it in src/config.js.'); return
  }
  setState('sending'); setErr('')
  try {
    const r = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'), email: f.get('email'), message: f.get('message'),
        _replyto: f.get('email'), _subject: `New project inquiry from ${f.get('name')}`
      })
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      throw new Error(d.errors?.map(x => x.message).join(', ') || d.error || `Error ${r.status}`)
    }
    gsap.to(formRef.current, { opacity: 0, y: -20, duration: .4, onComplete: () => {
      setState('success')
      requestAnimationFrame(() => gsap.fromTo(okRef.current, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .7, ease: 'back.out(1.7)' }))
    } })
  } catch (x) { setState('error'); setErr(x.message || 'Something went wrong. Please try again.') }
}
  return (
    <div className="form-card" data-r="right">
      {state === 'success' ? (
        <div className="form-ok" ref={okRef}><div className="ok-tick">✓</div><h3>Message sent!</h3>
          <p>Thank you! I'll get back to you soon.</p></div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate={false}>
          <div className="field"><label htmlFor="cf-name">Your name</label><input id="cf-name" name="name" placeholder="Full name" required /></div>
          <div className="field"><label htmlFor="cf-email">Your email</label><input id="cf-email" type="email" name="email" placeholder="you@example.com" required /></div>
          <div className="field"><label htmlFor="cf-msg">Project description</label><textarea id="cf-msg" name="message" placeholder="Tell me about your project, timeline and budget" required /></div>
          <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" className="hp" />
          <button className="btn btn-primary full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message →'}</button>
          <div className={`form-status ${state}`} role="status">{state === 'error' ? err : ''}</div>
        </form>)}
    </div>)
}

function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'); let W = 0, P = [], vis = true
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const init = () => {
      W = cv.clientWidth; if (!W) return
      cv.width = cv.height = W * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      P = Array.from({ length: W > 420 ? 30 : 18 }, () => { const sp = 5 + Math.random() * 9, a = Math.random() * 6.283
        return { x: Math.random() * W, y: Math.random() * W, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, sz: 1.4 + Math.random() * 1.6, o: Math.random() < .45 } })
    }
    const edge = q => Math.min(1, Math.min(q.x, W - q.x, q.y, W - q.y) / (W * .16))
    const draw = dt => {
      if (!vis || !W) return; ctx.clearRect(0, 0, W, W)
      P.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; if (q.x < 0 || q.x > W) q.vx *= -1; if (q.y < 0 || q.y > W) q.vy *= -1 })
      const th = W * .24
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y)
        if (d < th) { ctx.strokeStyle = `rgba(240,232,220,${(1 - d / th) * .4 * Math.min(edge(P[i]), edge(P[j]))})`; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke() }
      }
      P.forEach(q => { ctx.fillStyle = q.o ? `rgba(255,107,0,${.95 * edge(q)})` : `rgba(240,232,220,${.8 * edge(q)})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.sz, 0, 6.283); ctx.fill() })
    }
    init(); const ro = new ResizeObserver(init); ro.observe(cv)
    const io = new IntersectionObserver(e => { vis = e[0].isIntersecting }); io.observe(cv)
    if (reduce) draw(0); else { var tick = (t, ms) => draw(Math.min(ms, 50) / 1000); gsap.ticker.add(tick) }
    return () => { ro.disconnect(); io.disconnect(); if (tick) gsap.ticker.remove(tick) }
  }, [])
  return <canvas className="particles" ref={ref} aria-hidden="true" />
}

export default function App() {
  const root = useRef(null)
  const [cat, setCat] = useState('all'), [lb, setLb] = useState(null), [menu, setMenu] = useState(false)
  const list = cat === 'all' ? works : works.filter(w => w.cat === cat)
  const [active, setActive] = useState('')

  useLayoutEffect(() => {
    if (reduce) { document.querySelectorAll('.intro,.flyer').forEach(e => e.style.display = 'none'); return }
    const cleanups = []
    const ctx = gsap.context(() => {
      gsap.set('.hero [data-in]', { opacity: 0, y: 30 }); gsap.set('.hero .ch', { yPercent: 115 })
      gsap.set('header', { yPercent: -160 }); gsap.set('.profile-arch,.tag,.particles', { opacity: 0 }); document.body.style.overflow = 'hidden'
      const roles = ['Graphic Designer', 'Front-End Developer'], rEl = document.getElementById('heroRole')
      const loop = gsap.timeline({ repeat: -1, paused: true })
      roles.forEach(txt => { const o = { i: 0 }, set = () => { rEl.textContent = txt.slice(0, Math.round(o.i)) }
        loop.to(o, { i: txt.length, duration: txt.length * .075, ease: 'none', onUpdate: set }).to({}, { duration: 1.7 })
          .to(o, { i: 0, duration: txt.length * .04, ease: 'none', onUpdate: set }).to({}, { duration: .4 }) })
      const fl = document.querySelector('.flyer'), arch = document.querySelector('.profile-arch'), D = Math.min(innerWidth * .8, innerHeight * .62)
      const R = k => () => arch.getBoundingClientRect()[k]
      gsap.set(fl, { left: (innerWidth - D) / 2, top: (innerHeight - D) / 2, width: D, height: D, opacity: 0, scale: .8 })
      gsap.set('.intro-cap', { opacity: 0, y: 14 }); gsap.set('.fl-cut', { opacity: 1 })
      gsap.timeline()
        .to(fl, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' }, 0)
        .to('.intro-cap', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, .5)
        .to('.intro-cap', { opacity: 0, duration: .6, ease: 'power2.in' }, '+=.9')
        .addLabel('fly', '<')
        .to('.intro', { opacity: 0, duration: .9, ease: 'power2.inOut' }, 'fly+=.2')
        .to('.fl-cut', { opacity: 0, duration: .6, ease: 'power2.in' }, 'fly')
        .to('.fl-final', { opacity: 1, duration: .9, ease: 'power2.out' }, 'fly+=.35')
        .to(fl, { left: R('left'), top: R('top'), width: R('width'), height: R('height'), duration: 1.4, ease: 'power4.inOut' }, 'fly')
        .add(() => { gsap.set(arch, { opacity: 1 }); gsap.set(fl, { autoAlpha: 0 }); gsap.set('.intro', { display: 'none' }); document.body.style.overflow = '' })
        .to('header', { yPercent: 0, duration: .8, ease: 'power3.out' }, 'fly+=.5')
        .to('.hero .ch', { yPercent: 0, duration: .9, stagger: .03, ease: 'power4.out' }, 'fly+=.6')
        .to('.tag', { opacity: 1, duration: .7, stagger: .12, ease: 'power2.out' }, 'fly+=1.5')
        .to('.particles', { opacity: 1, duration: 1.4 }, 'fly+=1.5')
        .to('.hero [data-in]', { opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out' }, 'fly+=1.1')
        .add(() => loop.play(), 'fly+=1.2')
      ;['work', 'about', 'skills', 'experience', 'contact'].forEach(id => ScrollTrigger.create({ trigger: '#' + id, start: 'top 55%', end: 'bottom 55%', onToggle: s => s.isActive && setActive(id) }))
      gsap.to('.hero-grid > .profile', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.tag-1', { y: -8, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.tag-2', { y: 8, duration: 3.1, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } })
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => gsap.to('header', { yPercent: s.direction === 1 && s.scroll() > 240 ? -160 : 0, duration: .35, overwrite: 'auto' }) })
      gsap.to('.marquee-track', { x: -240, ease: 'none', scrollTrigger: { trigger: '.marquee-section', scrub: 1 } })

      gsap.utils.toArray('.h-mask > span').forEach(el => gsap.from(el, { yPercent: 115, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))
      gsap.utils.toArray('[data-r]').forEach(el => {
        const t = el.dataset.r, v = { opacity: 0, duration: 1, delay: +el.dataset.d || 0, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        const small = innerWidth < 900
        if (t === 'left') { if (small) v.y = 30; else v.x = -50 }
        else if (t === 'right') { if (small) v.y = 45; else v.x = 50 }
        else if (t === 'scale') v.scale = .9
        else v.y = 45
        gsap.from(el, v)
      })
      gsap.utils.toArray('[data-count]').forEach(el => {
        const o = { v: 0 }
        gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v) + (el.dataset.suffix || '') } })
      })
      gsap.utils.toArray('.ring').forEach(el => {
        const v = +el.dataset.v, fg = el.querySelector('.ring-fg'), num = el.querySelector('.ring-pct'), o = { n: 0 }
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          .from(el, { opacity: 0, scale: .8, duration: .7, ease: 'back.out(1.6)' })
          .to(fg, { strokeDashoffset: CIRC * (1 - v / 100), duration: 1.7, ease: 'power3.out' }, .15)
          .to(o, { n: v, duration: 1.7, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(o.n) + '%' } }, .15)
      })
      gsap.fromTo('.t-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 70%', scrub: true } })

      if (matchMedia('(hover:hover)').matches) {
        document.querySelectorAll('.btn').forEach(b => {
          const mv = e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }) }
          const lv = () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' })
          b.addEventListener('mousemove', mv); b.addEventListener('mouseleave', lv)
          cleanups.push(() => { b.removeEventListener('mousemove', mv); b.removeEventListener('mouseleave', lv) })
        })
      }
    }, root)
    return () => { cleanups.forEach(f => f()); ctx.revert() }
  }, [])

  useEffect(() => { // custom cursor
    if (reduce || !matchMedia('(hover:hover)').matches) return
    const d = document.querySelector('.cursor'); if (!d) return
    const x = gsap.quickTo(d, 'x', { duration: .25, ease: 'power3' }), y = gsap.quickTo(d, 'y', { duration: .25, ease: 'power3' })
    const mv = e => { x(e.clientX); y(e.clientY); d.classList.add('on') }
    const ov = e => d.classList.toggle('big', !!e.target.closest('a,button,.work-card,input,textarea'))
    addEventListener('mousemove', mv); addEventListener('mouseover', ov)
    return () => { removeEventListener('mousemove', mv); removeEventListener('mouseover', ov) }
  }, [])

  const nav = useCallback(d => setLb(i => (i + d + list.length) % list.length), [list.length])
  useEffect(() => {
    const L = document.querySelectorAll('.burger i')
    if (menu) {
      document.body.style.overflow = 'hidden'
      gsap.to('.mnav', { autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out' })
      gsap.fromTo('.mnav a', { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .5, delay: .1, ease: 'power3.out' })
      gsap.to(L[0], { y: 7, rotate: 45, duration: .3 }); gsap.to(L[1], { opacity: 0, duration: .2 }); gsap.to(L[2], { y: -7, rotate: -45, duration: .3 })
    } else {
      document.body.style.overflow = ''
      gsap.to('.mnav', { autoAlpha: 0, y: -20, duration: .3 })
      gsap.to(L[0], { y: 0, rotate: 0, duration: .3 }); gsap.to(L[1], { opacity: 1, duration: .3 }); gsap.to(L[2], { y: 0, rotate: 0, duration: .3 })
    }
  }, [menu])
  const go = e => { setMenu(false); const id = e.currentTarget.getAttribute('href'); if (id?.startsWith('#')) { e.preventDefault(); document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }) } }
  const marq = 'Graphic Design ✦ Brand Identity ✦ Logo Design ✦ Social Media Graphics ✦ Posters & Flyers ✦ Packaging ✦ Web Development '

  return (
    <div ref={root}>
      <div className="intro">
        <div className="intro-cap"><span>Umaima Bibi</span><em>Graphic Designer · Front-End Developer</em></div></div>
      <div className="flyer"><div className="fl-disc"><div className="fl-final"><img className="cut-in" src="./assets/cutout.webp" alt="" /></div></div><img className="fl-cut" src="./assets/cutout.webp" alt="" /></div>
      <div className="progress" /><div className="cursor" />
      <header>
        <div className="header-inner">
          <a href="#top" className="brand" onClick={go} aria-label="Home"><div className="logo">UB</div></a>
          <nav>{NAV.map(s => <a key={s} href={`#${s}`} className={active === s ? 'on' : ''} onClick={go}>{s[0].toUpperCase() + s.slice(1)}</a>)}</nav>
          <div className="header-actions">
            <a href="#contact" onClick={go} className="btn btn-primary">Get in touch</a>
            <button className="burger" onClick={() => setMenu(m => !m)} aria-label="Menu" aria-expanded={menu}><i /><i /><i /></button>
          </div>
        </div>

      </header>
        <div className="mnav">{NAV.map(s => <a key={s} href={`#${s}`} className={active === s ? 'on' : ''} onClick={go}>{s[0].toUpperCase() + s.slice(1)}</a>)}
          <a href="#contact" onClick={go} className="btn btn-primary">Get in touch</a></div>

      <main id="top">
        <section className="hero wrap"><div className="hero-grid">
          <div>
            <h1 className="hero-title"><span className="hero-line1"><Chars text="Hi, I'm Umaima" /></span><br />
              <em id="heroRole">{reduce ? 'Graphic Designer & Front-End Developer' : ''}</em><span className="type-cursor">|</span></h1>
            <p className="hero-sub" data-in>I design logos, posters, social media, packaging, brand identities and build clean, animated front-end experiences with React and GSAP.</p>
            <div className="hero-actions" data-in>
              <a href="#work" onClick={go} className="btn btn-primary">View Work →</a>
              <a href="./assets/Umaima_Bibi_CV.pdf" download className="btn btn-ghost">Download CV ⬇</a>
            </div>
            <div className="hero-stats" data-in>
              <div className="stat"><b>{works.length}+</b><span>Design pieces</span></div>
              <div className="stat"><b>2025</b><span>Freelancing since</span></div>
              <div className="stat"><b>3</b><span>Dev projects shipped</span></div>
            </div>
          </div>
          <div className="profile">
            <Particles />
            <div className="profile-arch"><img className="cut-in" src="./assets/cutout.webp" alt="Umaima Bibi" /></div>
            <div className="tag tag-1"><span className="dot" /> Open to work</div>
            <div className="tag tag-2"> Available for freelance</div>
          </div>
        </div></section>

        <div className="marquee-section"><div className="marquee-track"><span>{marq}</span><span>{marq}</span><span>{marq}</span></div></div>

        <section id="work" className="work-sec">
          <div className="wrap">
            <Head n="01 — Selected work" title="Work" />
            <Tabs cat={cat} setCat={setCat} />
            <div className="grid-status">Showing {list.length} of {works.length} pieces. Hover to slow down, click to view full</div>
          </div>
          <Stage key={cat} list={list} onOpen={id => setLb(list.findIndex(x => x.id === id))} />
        </section>

        <section id="about" className="wrap">
          <Head n="02 — About" title="About Me" />
          <div className="bento">
            <div className="b-card b-bio" data-r="up">
              <p>Aspiring software engineer and designer with hands-on tutoring experience. I care about building practical solutions and helping others learn. Whether that's a client's brand identity or a student's next breakthrough.</p>
              <p>Since August 2025 I've worked with clients on Freelancer.com creating logos, social media graphics, banners and branding materials, translating briefs into visuals and folding feedback back into the work. Alongside that I build front-end projects and study Software Engineering at DHA Suffa University.</p>
            </div>
            <div className="b-card b-stats" data-r="up" data-d=".1">
              <div><b data-count={works.length} data-suffix="+">0</b><span>Pieces designed</span></div>
              <div><b data-count="8">0</b><span>Design categories</span></div>
              <div><b data-count="3">0</b><span>Dev projects</span></div>
            </div>
            <div className="b-card b-facts" data-r="up" data-d=".05">
              <div className="panel-title">Quick facts</div>
              {[['Location', 'Karachi, Pakistan'], ['Languages', 'Urdu, English'], ['Currently', 'Freelance designer + tutor']].map(([a, b]) =>
                <div className="info-row" key={a}><span>{a}</span><span>{b}</span></div>)}
            </div>
            <div className="b-card b-edu" data-r="up" data-d=".15">
              <div className="panel-title">Learning</div>
              <div className="info-row"><span>B.S. Software Engineering</span><span>DHA Suffa University</span></div>
              <div className="info-row"><span>Web & App Development</span><span>Saylani Mass IT</span></div>
            </div>
          </div>
        </section>

        <section id="skills" className="wrap">
          <Head n="03 — Expertise" title="Skills" />
          <div className="rings">{SKILLS.map(s => <Ring key={s.name} s={s} />)}</div>
        </section>

        <section id="experience" className="wrap">
          <Head n="04 — Journey" title="Experience" />
          <div className="timeline"><div className="t-line" />
            {TIMELINE.map(t => (
              <div className="t-item" key={t.role} data-r="left">
                <div className="t-date">{t.date}</div><div className="t-role">{t.role}</div><div className="t-org">{t.org}</div>
                {t.pts.length > 0 && <ul className="t-desc">{t.pts.map(p => <li key={p}>{p}</li>)}</ul>}
              </div>))}
          </div>
        </section>

        <section id="contact" className="contact-section"><div className="wrap">
          <Head n="05 — Contact" title="Let's Connect" />
          <div className="contact-grid">
            <div data-r="left">
              <p className="lead">Have a brand, poster or website in mind? Tell me about it. I'd love to work together.</p>
              <div className="contact-info">
                <div><span className="label">Email</span><a href="mailto:umaimabibi05@gmail.com">umaimabibi05@gmail.com</a></div>
                <div><span className="label">Phone</span><a href="tel:+923303768194">+92 330 3768194</a></div>
                <div><span className="label">Location</span><b>{SOCIAL.location}</b></div>
              </div>
              <div className="socials">
                <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedIn /></a>
                <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHub /></a>
                <a href="mailto:umaimabibi05@gmail.com" aria-label="Email"><Mail /></a>
              </div>
            </div>
            <Contact />
          </div>
        </div></section>
      </main>

      <footer>
        <div className="wrap footer-top">
          <div className="footer-brand"><div className="logo">UB</div><p className="footer-tagline">Graphic design & front-end craft for brands that want to be remembered, based in Karachi, Pakistan.</p></div>
          <div className="footer-links">
            <div><span className="label">Navigate</span>{['work', 'about', 'skills', 'contact'].map(s => <a key={s} href={`#${s}`} onClick={go}>{s[0].toUpperCase() + s.slice(1)}</a>)}</div>
            <div><span className="label">Get in touch</span><a href="mailto:umaimabibi05@gmail.com">umaimabibi05@gmail.com</a><a href="tel:+923303768194">+92 330 3768194</a></div>
          </div>
        </div>
        <div className="wrap footer-bottom"><span>© 2026 Umaima Bibi M. Aslam</span>
          <button className="to-top" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></div>
      </footer>
      {lb !== null && <Lightbox list={list} index={lb} onClose={() => setLb(null)} onNav={nav} />}
    </div>)
}
